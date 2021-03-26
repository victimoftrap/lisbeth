export const currentDatetime = () => new Date().toISOString()

export const getCookie = (name) => {
    const cookieNameMatcher = document.cookie.match(new RegExp('(^| )' + name + '=([^;]+)'));
    if (cookieNameMatcher) {
        return cookieNameMatcher[2];
    }
};
