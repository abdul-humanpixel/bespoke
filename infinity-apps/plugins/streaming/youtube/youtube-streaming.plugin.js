(function() {
    const CLIENT_ID =
        'PROVIDE_CLIENT_ID'; //https://developers.google.com/youtube/v3/getting-started
    const DOMAIN = 'PROVIDE_DOMAIN_OF_YOUR_APP'; //eg domain.com
    const REDIRECT_URI = `https%3A%2F%2F${DOMAIN}%2Fwebapp2%2Fredirect.html`;
    const OAUTH_URL = `https://accounts.google.com/o/oauth2/auth?client_id=${CLIENT_ID}&redirect_uri=${REDIRECT_URI}&scope=https://www.googleapis.com/auth/youtube&response_type=token`;

    const ELEMENT_IDS = {
        GO_LIVE: 'go-live',
        STOP_LIVE: 'stop-live',
        ENABLE_WAITING_SCREEN_WRAPPER: 'enable-waiting-screen-wrapper',
        ENABLE_WAITING_SCREEN: 'enable-waiting-screen',
        DISABLE_WAITING_SCREEN_WRAPPER: 'disable-waiting-screen',
        DISABLE_WAITING_SCREEN: 'disable-waiting-screen'
    };

    const ICONS = {
        START_RECORDING: {
            icon: 'startRecording.svg#startRecording',
            label: 'Stream to youtube'
        },
        STOP_RECORDING: {
            icon: 'stopRecording.svg#stopRecording',
            label: 'Youtube streaming info'
        }
    };

    const state$ = window.PEX.pluginAPI.createNewState(ICONS.START_RECORDING);

    let rtmpURL;
    let broadcastId;
    let accessToken;
    let authWindow;
    let isActive = false;
    let dialog;
    let streamingUuidParticipant;
    let isWaitingScreenEnabled = false;
    let broadcastStatus;

    let disconnectParticipant$;
    let disconnectFromConference$;

    function load(participants$, conferenceDetails$) {
        document.body.addEventListener(
            'click',
            handleGlobalEventListeners,
            true
        );

        disconnectParticipant$ = window.PEX.actions$
            .ofType(window.PEX.actions.PARTICIPANT_DISCONNECT_SUCCESS)
            .subscribe(action => {
                if (
                    streamingUuidParticipant &&
                    action.payload === streamingUuidParticipant
                ) {
                    reset();
                    if (dialog && dialog.close) {
                        dialog.close();
                    }
                }
            });

        disconnectFromConference$ = window.PEX.actions$
            .ofType(window.PEX.actions.DISCONNECT_SUCCESS)
            .subscribe(action => {
                reset();
            });
    }

    function handleGlobalEventListeners(e) {
        switch (e.srcElement.id) {
            case ELEMENT_IDS.GO_LIVE:
                setBroadcastStatus('live');
                document
                    .getElementById(ELEMENT_IDS.GO_LIVE)
                    .setAttribute('hidden', '');
                document
                    .getElementById(ELEMENT_IDS.STOP_LIVE)
                    .removeAttribute('hidden');
                return;
            case ELEMENT_IDS.STOP_LIVE:
                setBroadcastStatus('complete');
                if (dialog && dialog.close) {
                    dialog.close();
                }
                if (streamingUuidParticipant) {
                    window.PEX.pluginAPI.disconnectParticipant(
                        streamingUuidParticipant
                    );
                }
                reset();
                return;
            case ELEMENT_IDS.ENABLE_WAITING_SCREEN:
                setWaitingScreenStatus(true);
                document
                    .getElementById(ELEMENT_IDS.ENABLE_WAITING_SCREEN_WRAPPER)
                    .setAttribute('hidden', '');
                document
                    .getElementById(ELEMENT_IDS.DISABLE_WAITING_SCREEN_WRAPPER)
                    .removeAttribute('hidden');
                return;

            case ELEMENT_IDS.DISABLE_WAITING_SCREEN:
                setWaitingScreenStatus(false);
                document
                    .getElementById(ELEMENT_IDS.DISABLE_WAITING_SCREEN_WRAPPER)
                    .setAttribute('hidden', '');
                document
                    .getElementById(ELEMENT_IDS.ENABLE_WAITING_SCREEN_WRAPPER)
                    .removeAttribute('hidden');
                return;
        }
    }

    function setBroadcastStatus(status) {
        broadcastStatus = status;
        sendRequest(
            `https://www.googleapis.com/youtube/v3/liveBroadcasts/transition?broadcastStatus=${broadcastStatus}&id=${broadcastId}&part=id,status`
        );
    }

    function openYtStreamingDialog(participants) {
        if (!rtmpURL) {
            return streamingDialog();
        }

        return streamingInfoDialog(participants);
    }

    function streamingDialog() {
        return PEX.pluginAPI
            .openTemplateDialog(
                {
                    title: 'Youtube streaming',
                    body: `<div id="information" hidden>
                        Authorization...
                   </div>
                    <form id="form">
                        <div class="pex-dialog-content-message" style="display: flex">
                            <input placeholder="Provide video name" required type="text" name="title" class="pex-text-input" style="margin-right: 10px">
                            <select class="pex-text-input" style="width: auto" name="privacy" id="privacy">
                                <option value="unlisted">Unlisted</option>
                                <option value="public">Public</option>
                                <option value="private">Private</option>
                            </select>
                        </div>
                        <button type="submit" class="dialog-button green-action-button">Add recording</button>
                    </form>
                   `
                },
                1001
            )
            .subscribe(dialogRef => {
                dialog = dialogRef;
                dialogRef.viewInit$.subscribe(() => {
                    document
                        .getElementById('form')
                        .addEventListener(
                            'submit',
                            handleSubmit.bind(this, dialogRef)
                        );
                });
            });
    }

    function streamingInfoDialog(participants) {
        return PEX.pluginAPI
            .openTemplateDialog(
                {
                    title: 'Youtube streaming',
                    body: `<div id="information">
                        Loading info...
                   </div>
                   `
                },
                1001
            )
            .subscribe(dialogRef => {
                dialog = dialogRef;
                dialogRef.viewInit$.subscribe(() => {
                    document.getElementById(
                        'information'
                    ).innerHTML = provideInfo(participants);
                });
            });
    }

    function handleSubmit(dialogRef, event) {
        event.preventDefault();
        document.getElementById('form').setAttribute('hidden', '');
        document.getElementById('information').removeAttribute('hidden');
        authPopup(OAUTH_URL, dialogRef);
    }

    function authPopup(url, dialogRef) {
        const windowOpts = `toolbar=0,scrollbars=1,status=1,resizable=1,location=1,menuBar=0,width=500,height=500,left=500,top=500`;
        authWindow = window.open(url, 'producthuntPopup', windowOpts);
        window.addEventListener('message', handleMessageEvent);
    }

    const handleMessageEvent = async event => {
        if (event.data && event.data.hash) {
            if (event.data.hash.includes('access_token')) {
                const params = new URLSearchParams(event.data.hash.substr(1));
                accessToken = params.get('access_token');
                const scheduledStartTime = new Date().toISOString();
                const promises = [];

                promises.push(
                    sendRequest(
                        'https://www.googleapis.com/youtube/v3/liveBroadcasts?part=snippet,status,contentDetails',
                        {
                            part: 'snippet,status,contentDetails',
                            snippet: {
                                title: `Pexip streaming ${scheduledStartTime}`,
                                scheduledStartTime
                            },
                            contentDetails: {
                                monitorStream: {
                                    enableMonitorStream: false
                                }
                            },
                            status: {
                                privacyStatus: 'unlisted'
                            }
                        }
                    )
                );

                promises.push(
                    sendRequest(
                        'https://www.googleapis.com/youtube/v3/liveStreams?part=snippet,cdn',
                        {
                            part: 'snippet,status',
                            snippet: {
                                title: `Pexip streaming ${scheduledStartTime}`
                            },
                            cdn: {
                                format: '720p',
                                ingestionType: 'rtmp'
                            }
                        }
                    )
                );

                const [broadcast, streaming] = await Promise.all(promises);

                if (!streaming.cdn) {
                    return;
                }

                await sendRequest(
                    `https://www.googleapis.com/youtube/v3/liveBroadcasts/bind?part=id,contentDetails&streamId=${
                        streaming.id
                    }&id=${broadcast.id}`
                );

                document.getElementById('information').innerHTML =
                    'Waiting for the stream to be active...';
                waitUntilActive(streaming.id);

                rtmpURL = `${streaming.cdn.ingestionInfo.ingestionAddress}/${
                    streaming.cdn.ingestionInfo.streamName
                }`;
                broadcastId = broadcast.id;
                window.PEX.pluginAPI.dialOut(
                    rtmpURL,
                    'rtmp',
                    'guest',
                    value => {
                        console.log(value);
                        if (value && value.result && value.result[0]) {
                            streamingUuidParticipant = value.result[0];
                            setWaitingScreenStatus(true);
                        }
                        // dialogRef.close();
                    },
                    {
                        streaming: true
                    }
                );
            }

            authWindow.close();
        }
    };

    async function waitUntilActive(id) {
        const { items } = await sendRequest(
            `https://www.googleapis.com/youtube/v3/liveStreams?part=id,status&id=${id}`,
            null,
            'GET'
        );

        const lifeStream = items[0];

        if (lifeStream.status && lifeStream.status.streamStatus === 'active') {
            isActive = true;
        }

        if (isActive) {
            document.getElementById('information').innerHTML = provideInfo();
            return;
        }

        waitUntilActive(id);
    }

    function setWaitingScreenStatus(isEnabled) {
        window.PEX.pluginAPI.transformConferenceLayout({
            streaming: {
                waiting_screen_enabled: isEnabled
            }
        });
        isWaitingScreenEnabled = isEnabled;
    }

    async function sendRequest(url, body, method = 'POST') {
        try {
            const params = {
                method,
                headers: {
                    Authorization: `Bearer ${accessToken}`,
                    'Content-Type': 'application/json'
                }
            };

            if (method === 'POST') {
                params.body = body ? JSON.stringify(body) : '';
            }

            const data = await (await fetch(url, params)).json();

            if (data.error) {
                const info = document.querySelector('#information');
                info.innerText = data.error.message;
            }
            console.log(url, data);
            return data;
        } catch (e) {
            console.error(e);
        }
    }

    function provideInfo(participants) {
        state$.next(ICONS.STOP_RECORDING);
        let goLiveBtn = `
            <a id="${
                ELEMENT_IDS.GO_LIVE
            }" class="dialog-button green-action-button" ${
            broadcastStatus === 'live' ? 'hidden' : ''
        }>Go live</a>
        `;

        let stopLiveBtn = `
            <a id="${ELEMENT_IDS.STOP_LIVE}" ${
            broadcastStatus === 'live' ? '' : 'hidden'
        } class="dialog-button red-action-button">Stop streaming</a>
        `;

        let waitingScreenOff = `
            <p id="${ELEMENT_IDS.ENABLE_WAITING_SCREEN_WRAPPER}" hidden>
                Waiting screen disabled <a id="${
                    ELEMENT_IDS.ENABLE_WAITING_SCREEN
                }" class="dialog-button green-non-action-button">Enable</a>
            </p>
        `;

        let waitingScreenOn = `
            <p id="${ELEMENT_IDS.DISABLE_WAITING_SCREEN_WRAPPER}">
                Waiting screen enabled <a id="${
                    ELEMENT_IDS.DISABLE_WAITING_SCREEN
                }" class="dialog-button green-non-action-button">Disable</a>
            </p>
        `;

        return `
            <p>rtmp url: <span style="font-weight:bold">${rtmpURL}</span></p>
            ${waitingScreenOn}
            ${waitingScreenOff}
            <p style="padding-top: 25px">
                ${goLiveBtn}    
                ${stopLiveBtn}
                <a
                    target="_blank"
                    href="https://www.youtube.com/live_event_analytics?v=${broadcastId}"
                    class="dialog-button blue-action-button"
                    style="text-decoration: none;"
                >
                    yt control room
                </a>
            </p>
        `;
    }

    function isStreamingParticipantAdded(participants) {
        return participants.reduce((prev, curr) => {
            if (curr.uri && curr.uri === rtmpURL) {
                prev = true;
            }

            return prev;
        }, false);
    }

    function reset() {
        rtmpURL = null;
        broadcastId = null;
        accessToken = null;
        authWindow = null;
        isActive = null;
        window.removeEventListener('message', handleMessageEvent);
        state$.next(ICONS.START_RECORDING);
        // document.getElementById('form').removeEventListener(
        //     'submit',
        //     handleSubmit
        // );
    }

    // unload / cleanup function
    function unload() {
        reset();
        if (disconnectParticipant$) {
            disconnectParticipant$.unsubscribe();
        }
        if (disconnectFromConference$) {
            disconnectFromConference$.unsubscribe();
        }
        document.body.removeEventListener('click', handleGlobalEventListeners);
    }

    // Register our plugin with the PluginService - make sure id matches your package.json
    window.PEX.pluginAPI.registerPlugin({
        id: 'yt-streaming-plugin-1.0',
        load,
        unload,
        openYtStreamingDialog,
        state$
    });
})(); // End IIFE
