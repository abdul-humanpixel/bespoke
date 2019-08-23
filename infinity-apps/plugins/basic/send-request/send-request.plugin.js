
(function() {
    const ACTION_NAME = '[Conference] Connect Success';
    const SEND_REQUEST_ENDPOINT = 'muteguests';

    function load() {           
        window.PEX.actions$
            .ofType(ACTION_NAME)
            .subscribe(({ payload: actionData }) => {
               if(actionData && actionData.joinRole === 'HOST') {
                   window.PEX.pluginAPI.sendRequest(SEND_REQUEST_ENDPOINT, undefined, () => {
                       console.log('You muted all guests using sendRequest!');
                   });
               }
            });
    }

    function unload() {}

    window.PEX.pluginAPI.registerPlugin({
        id: 'send-request-plugin-1.0',
        load: load,
        unload: unload
    });
})();
