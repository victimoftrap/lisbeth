const getCookie = (name) => {
    const cookieNameMatcher = document.cookie.match(new RegExp('(^| )' + name + '=([^;]+)'));
    if (cookieNameMatcher) {
        return cookieNameMatcher[2];
    }
};

export default getCookie
