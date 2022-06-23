import { createApp } from 'vue'
import App from './App.vue'
import naive from 'naive-ui'
import { createAuth0 } from '@auth0/auth0-vue';

createApp(App)
    .use(naive)
    .use(
        createAuth0({
            domain: "dev-pmw60n9g.us.auth0.com",
            client_id: "b2vBQxrJSeGjwRDulFozJtQ2kYg8lC59",
            redirect_uri: window.location.origin,
            audience: "https://ample.hashwave.io/api",
            scope:"read:db read_write:ethsign",
        })
    )
    .mount('#app')
