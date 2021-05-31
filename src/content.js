import { APP_STATES } from './constants/appStates';
import { USER_EVENTS } from './constants/userEventTypes';
import { LISBETH_GRAB, GRAB_ON_RELOAD, NO_GRAB } from './constants/codeGrabberConstants';
import { PROBLEM_TYPES } from './constants/problemTypes';

import { currentDatetime, getCookie } from './utils'

const LISBETH_STATE = 'lisbeth-state';

// Start communication port of content and background script.
// Must be started ASAP, or connection could be not created on first message.
let port = chrome.runtime.connect({ name: 'lisbeth' });

/**
 * Send message with created event to background script.
 * @param {String} type - type of event
 * @param {Object} event - specific event object
 */
const sendTrackingMessage = (type, event) => {
    port.postMessage({
        contestId: YANDEX_CONTEST_ID,
        userId: YANDEX_USER_ID,
        userLogin: YANDEX_USER_LOGIN,
        createdAt: currentDatetime(),
        type: type,
        event: event
    });
};

const injectMouseListeners = () => {
    let mainPage = document.getElementsByClassName('b-page__body')[0];
    mainPage.addEventListener('mouseleave', (event) => {
        sendTrackingMessage(USER_EVENTS.MOUSE_LEAVE_EVENT, event);
    });
    mainPage.addEventListener('mouseenter', (event) => {
        sendTrackingMessage(USER_EVENTS.MOUSE_ENTER_EVENT, event);
    });
};

const injectRightCornerProblemSwitherListeners = () => {
    // main problem switcher (on right corner)
    const problemsTabsUl = document.getElementsByClassName('tabs-menu_role_problems')[0];
    const liTabsList = problemsTabsUl.getElementsByTagName('li');
    for (const problemTab of liTabsList) {
        problemTab.addEventListener('click', (event) => {
            sendTrackingMessage(USER_EVENTS.PROBLEM_CHANGED_EVENT, {
                prevProblemId: CURRENT_PROBLEM.id,
                prevProblemTitle: CURRENT_PROBLEM.title,
                prevProblemUrl: CURRENT_PROBLEM.url,
            });
        });
    }
};

const injectPageBottomProblemSwitcherListeners = () => {
    // secondary problem switcher
    // buttons a on page bottom 'Следующая' and 'Предыдущая'
    const problemsNavBar = document.getElementsByClassName('problem__problems-nav')[0];
    const navBarLinksList = problemsNavBar.getElementsByTagName('a');
    for (const problemLink of navBarLinksList) {
        problemLink.addEventListener('click', (event) => {
            sendTrackingMessage(USER_EVENTS.PROBLEM_CHANGED_EVENT, {
                prevProblemId: CURRENT_PROBLEM.id,
                prevProblemTitle: CURRENT_PROBLEM.title,
                prevProblemUrl:CURRENT_PROBLEM.url,
            });
        });
    }
};

const injectDropDownProblemSwithcerEvents = () => {
    // problem switcher on '/submits' page
    // drop-down list with all problems
    const dropDownProblemSwitcher = document.getElementsByClassName('problem__switcher')[0];
    const problemSwitcherSpan = dropDownProblemSwitcher.querySelector('span');

    const buttonOnSelect = problemSwitcherSpan.querySelector('button');
    buttonOnSelect.addEventListener('click', (event) => {
        const problemsPopup = document.getElementsByClassName('popup_visibility_visible')[0];
        const problemsList = problemsPopup.querySelector('div').querySelectorAll('div');
        const problemsObservers = [];
        for (let i = 0; i < problemsList.length; i++) {
            // create mutation observer that will watch changes in attributes
            // if task selected in drop-down list, element will get 'select__item_selected_yes' class
            const mutationObserver = new MutationObserver((mutations) => {
                const problemIndex = i - 1;

                mutations.forEach((mut) => {
                    if (mut.target.classList.contains('select__item_selected_yes')) {
                        const problemName = mut.target.innerText;
                        if (CURRENT_PROBLEM.title !== problemName) {
                            sendTrackingMessage(USER_EVENTS.PROBLEM_CHANGED_EVENT, {
                                prevProblemId: CURRENT_PROBLEM.id,
                                prevProblemTitle: CURRENT_PROBLEM.title,
                                prevProblemUrl:CURRENT_PROBLEM.url,
                            });

                            CURRENT_PROBLEM.title = problemName;
                            CURRENT_PROBLEM.url = window.location.pathname;

                            const problemForm = document.getElementsByClassName('problem__item')[problemIndex];
                            const solutionInfo = problemForm.getElementsByClassName('problem__solution')[0]
                                .getElementsByClassName('solution')[0];
                            CURRENT_PROBLEM.id = JSON.parse(solutionInfo.dataset.bem).solution.problemId;
                        }
                    }
                });
            });
            problemsObservers.push(mutationObserver);

            mutationObserver.observe(problemsList[i], {
                attributes: true,
            });
        }
    });
};

const injectSendProblemListeners = () => {
    const sendProblemButton = document.getElementsByClassName('button_role_submit')[0];
    sendProblemButton.addEventListener('click', (event) => {
        const solutionElementCollection = document.getElementsByClassName('solution');
        for (let solution of solutionElementCollection) {
            const problemId = JSON.parse(solution.dataset.bem).solution.problemId;
            if (problemId === CURRENT_PROBLEM.id) {
                const elementClassList = solution.classList;
                if (elementClassList.contains(PROBLEM_TYPES.CODE)) {
                    // extract will be executed after page reload
                    localStorage.setItem(LISBETH_GRAB, GRAB_ON_RELOAD);
                }
                // !!! Temporarily disabled, working only w/ user code !!!
                // if (elementClassList.contains(PROBLEM_TYPES.TEXT)) {
                //     extractSolutionText();
                // }
                // if (elementClassList.contains(PROBLEM_TYPES.CHECKBOX)) {
                //     extractSolutionCheckbox();
                // }
                // if (elementClassList.contains(PROBLEM_TYPES.MATCH)) {
                //     extractSolutionMatch();
                // }
            }
        }

        sendTrackingMessage(USER_EVENTS.PROBLEM_SENT_EVENT, {
            problemId: CURRENT_PROBLEM.id,
            problemTitle: CURRENT_PROBLEM.title,
            problemUrl: CURRENT_PROBLEM.url,
        });
    });
};

const extractSolutionCheckbox = () => {
    const checkboxElementList = document.getElementsByClassName('solution_type_checkbox')[0].querySelectorAll('li');
    const normalCheckboxList = [];
    checkboxElementList.forEach((checkbox) => {
        if (!checkbox.classList.contains('solution__field_role_default-value')) {
            normalCheckboxList.push(checkbox);
        }
    });

    const checklist = [];
    normalCheckboxList.forEach((elem) => {
        const checkboxSpanWrapper = elem.querySelector('span');
        const titie = checkboxSpanWrapper.querySelector('label').innerText;
        const checked = checkboxSpanWrapper.querySelector('span').classList.contains('checkbox__box_checked_yes');

        const checkbox = {
            title: titie,
            checked: checked,
        };
        checklist.push(checkbox);
    });
    const message = {
        problemId: CURRENT_PROBLEM.id,
        problemTitle: CURRENT_PROBLEM.title,
        problemUrl: CURRENT_PROBLEM.url,
        checklist: checklist,
    };
    sendTrackingMessage(USER_EVENTS.SOLUTION_CHECKBOX_SENT_EVENT, message);
};

const extractSolutionText = () => {
    const textInputField = document.getElementsByClassName('solution_type_text')[0].getElementsByClassName('input__control')[0];
    const message = {
        problemId: CURRENT_PROBLEM.id,
        problemTitle: CURRENT_PROBLEM.title,
        problemUrl: CURRENT_PROBLEM.url,
        text: textInputField.value,
    };
    sendTrackingMessage(USER_EVENTS.SOLUTION_TEXT_SENT_EVENT, message);
};

const extractSolutionMatch = () => {
    const columnLabelList = document.getElementsByClassName('solution__header')[0].getElementsByClassName('solution__cell_type_label');
    const matchRowsElements = document.getElementsByClassName('solution__row');

    const matchList = [];
    for (let row of matchRowsElements) {
        const rowLabel = row.querySelector('div').innerText;
        const matchDots = row.getElementsByClassName('radiobox solution__cell');

        for (let i = 0; i < matchDots.length; i++) {
            const dotLabel = matchDots[i].querySelector('label');

            if (dotLabel.classList.contains('radiobox__radio_checked_yes')) {
                const columnLabel = columnLabelList[i].innerText;
                const matchedPair = {
                    param1: rowLabel,
                    param2: columnLabel,
                };
                console.log(matchedPair);
                matchList.push(matchedPair);
            }
        }
    }

    console.log(matchList);
    const message = {
        problemId: CURRENT_PROBLEM.id,
        problemTitle: CURRENT_PROBLEM.title,
        problemUrl: CURRENT_PROBLEM.url,
        match: matchList,
    };
    sendTrackingMessage(USER_EVENTS.SOLUTION_MATCH_SENT_EVENT, message);
};

const extractSolutionCode = () => {
    const grab = localStorage.getItem(LISBETH_GRAB);
    if (grab === GRAB_ON_RELOAD) {
        localStorage.setItem(LISBETH_GRAB, NO_GRAB);

        const compilerOptionsSelector = document.getElementsByClassName('select_role_compiler-list');
        let compilerName = '';
        if (compilerOptionsSelector.length != 0) {
            const compilerCollections = compilerOptionsSelector[0].querySelector('select').querySelectorAll('option');
            for (const compiler of compilerCollections) {
                if (compiler.selected) {
                    compilerName = compiler.innerText;
                }
            }
        }
        
        const solutionType = localStorage.getItem('solutionType');
        const sourceCode = document.getElementsByClassName('input__control')[0].innerText;
    
        const message = {
            problemId: CURRENT_PROBLEM.id,
            problemTitle: CURRENT_PROBLEM.title,
            problemUrl: CURRENT_PROBLEM.url,
            compiler: compilerName,
            solutionType: solutionType,
            source: sourceCode,
        };
        sendTrackingMessage(USER_EVENTS.SOLUTION_CODE_SENT_EVENT, message);
    }
};

const disableContentListeners = () => {
    const mainPage = document.getElementsByClassName('b-page__body')[0];
    mainPage.removeEventListener('mouseleave', (event) => {
        sendTrackingMessage(USER_EVENTS.MOUSE_LEAVE_EVENT, event);
    });
    mainPage.removeEventListener('mouseenter', (event) => {
        sendTrackingMessage(USER_EVENTS.MOUSE_ENTER_EVENT, event);
    });
};

// Getting contest ID from browser's pathname
let YANDEX_CONTEST_ID = 0;

// This is string value of 'yandexuid' because its not fits in JS Number type.
// Coverted as BigInt, it have troubles with JSON, so it would be just string.
let YANDEX_USER_ID = '';
let YANDEX_USER_LOGIN = '';

let CURRENT_PROBLEM = {
    title: '',
    url: '',
    id: '',
};

const getContestInfo = () => {
    YANDEX_CONTEST_ID = parseInt(window.location.pathname.match(new RegExp('(contest\/)([0-9]+)'))[2]);
    YANDEX_USER_ID = getCookie('yandexuid');
    YANDEX_USER_LOGIN = getCookie('yandex_login');
};

const getProblemInfo = () => {
    const problemsPageTitle = document.getElementsByClassName('title');
    if (problemsPageTitle.length !== 0) {
        CURRENT_PROBLEM.title = problemsPageTitle[0].innerText;
        CURRENT_PROBLEM.id = JSON.parse(document.getElementsByClassName('solution')[0].dataset.bem).solution.problemId;
    } else {
        const problemCollection = document.getElementsByName('problemId')[0].querySelectorAll('option');
        for (const problem of problemCollection) {
            if (problem.selected) {
                CURRENT_PROBLEM.title = problem.innerText;
                CURRENT_PROBLEM.id = problem.value;
            }
        }
    }
    CURRENT_PROBLEM.url = window.location.pathname;
};

/**
 * Check current application state.
 * On tracking state, inject all event listeners on 'problems' or 'submits' page.
 * On stopped tracking state, remove some listeners.
 * On idle state do nothing.
 */
const checkAppState = () => {
    const lisbethState = localStorage.getItem(LISBETH_STATE);
    if (lisbethState === null) {
        localStorage.setItem(LISBETH_STATE, APP_STATES.IDLE);
    }

    // contest is running, watch the world
    if (lisbethState === APP_STATES.START_TRACKING) {
        const currentUrl = window.location.href;
        const problemsTab = new RegExp('(\/problems)');
        const submitsTab = new RegExp('(\/submits)');
        
        // if user on page https://contest.yandex.ru/contest/{CONTEST_ID}/problems
        if (currentUrl.match(problemsTab) != null) {
            getContestInfo();
            getProblemInfo();

            injectMouseListeners();
            injectRightCornerProblemSwitherListeners();
            injectPageBottomProblemSwitcherListeners();
            injectSendProblemListeners();
            extractSolutionCode();
        } else if (currentUrl.match(submitsTab) != null) {
            // if user on page https://contest.yandex.ru/contest/{CONTEST_ID}/submits
            getContestInfo();
            getProblemInfo();

            injectMouseListeners();
            injectDropDownProblemSwithcerEvents();
            injectSendProblemListeners();
            extractSolutionCode();
        } else {
            // all another pages
            console.log('Patrego');
        }
    }

    // contest ended by pressing 'Завершить' button
    if (lisbethState === APP_STATES.STOP_TRACKING) {
        disableContentListeners();
        localStorage.setItem(LISBETH_STATE, APP_STATES.IDLE);
    }
};

checkAppState();

const startContestButtons = document.getElementsByClassName('button_theme_action')[0];
// button that submits new solution also has 'button_theme_action' class
if (startContestButtons !== undefined && !startContestButtons.classList.contains('button_role_submit')) {
    startContestButtons.addEventListener('click', event => {
        getContestInfo();
        port.postMessage({
            type: APP_STATES.START_TRACKING,
            init: {
                contestId: YANDEX_CONTEST_ID,
                userId: YANDEX_USER_ID,
                userLogin: YANDEX_USER_LOGIN,
            },
        });
        localStorage.setItem(LISBETH_STATE, APP_STATES.START_TRACKING);
    });
}

const endContestButtons = document.getElementsByClassName('button_role_end')[0];
if (endContestButtons !== undefined) {
    endContestButtons.addEventListener('click', event => {
        port.postMessage({
            type: APP_STATES.STOP_TRACKING,
        });
        localStorage.setItem(LISBETH_STATE, APP_STATES.STOP_TRACKING);
    });
}
