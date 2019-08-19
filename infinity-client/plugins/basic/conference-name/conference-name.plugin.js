
(function() {
    const ACTION_NAME = '[Conference] Connect Success';
    let conferenceName;

    function load() {           
        window.PEX.actions$
            .ofType(ACTION_NAME)
            .subscribe(({ payload: actionData }) => {
                conferenceName = actionData.alias;
            });
    }

    function unload() {}

    window.PEX.pluginAPI.registerPlugin({
        id: 'conference-name-plugin-1.0',
        load: load,
        unload: unload
    });
})();
