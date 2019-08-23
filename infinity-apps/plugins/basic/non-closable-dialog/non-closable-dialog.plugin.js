(function() {
    function load() {           
        PEX.pluginAPI.openTemplateDialog(
            {
                title: 'Test non closable dialog plugin',
                isCloseDisabled: true
            },
            'static',
            1001
        );
    }

    function unload() {}

    window.PEX.pluginAPI.registerPlugin({
        id: 'non-closable-dialog-plugin-1.0',
        load: load,
        unload: unload
    });
})();
