Some further background on our JavaScript API for embedding WebRTC into web pages and communicating with Pexip Virtual Meeting Rooms.

We provide a wrapper library called pexrtc.js which provides a stable and simplified API to our signalling and key WebRTC functionality, allowing you to easily build web apps which interface with Pexip’s API.

PexRTC as as library is fetched from a Pexip conferencing node by your web app; the external API remains the same but internally we may make changes to version it against the Pexip node. The Pexip JavaScript API is documented here: https://docs.pexip.com/api_client/api_pexrtc.htm

You should reference “https://<confnode>/static/webrtc/js/pexrtc.js” as a <script> element on the web page you are developing, to access the JavaScript library available on all Pexip conferencing nodes.

These examples are very simple and do not cover all features of the API, but exist to show web developers how to integrate with the API.

The simplest possible demo exists in "webrtc-demo”. This demonstrates how to use the “PexRTC” API to connect to a meeting room and present it on the web page in just a few lines. Hopefully the example within is clear - it joins a given meeting room “meet.demo” on pexipdemo.com, with a name “Visitor”, and a bandwidth of 576kbps, and an empty PIN. This then populates the <video> HTML element given later on. You would probably need to bulk out the accompanying JavaScript with some other functions to give the features you require.

To illustrate the power of our API, we can also provide a pre-packaged, stand-alone version a simple WebRTC site. This is “webrtc-site-v18”. This contains basic WebRTC conference functionality for Chrome, FF, Edge, and Safari, as well as the Flash functionality to join in IE. Note that this does not provide conference control or chat functionality that exists in our current WebApp. However, this shows a more advanced usage of our PexRTC API while still being in a manageable, single-file form that professional web developers can extend to fit into a fully-featured site.

You can install this on any web server and make two changes to the conference.html and conference-flash.html files: change the <script> tag for pexrts.js to be prefixed with your conferencing node, and in the “initialise” command change document.domain to also be your conferencing node. Note that the SSL certificate on this site must be trusted by clients since otherwise the user will not get any notification to accept it. The image can be changed (img/logo.png), the heading can be changed (in the two HTML pages) and the CSS can be re-styled if necessary (e.g. a different size for the image, or changing the highlight colours on the button). This demonstrates how our API can be used to integrate WebRTC into an interactive web page.
