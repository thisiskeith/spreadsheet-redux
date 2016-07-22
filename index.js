import 'babel-polyfill'
import App from './containers/App'
import App2 from './containers/App2'
import configureStore from './store/configureStore'
import React from 'react'
import { Provider } from 'react-redux'
import { render } from 'react-dom'

const store = configureStore()

render(
    <Provider store={store}>
        <App2 />
    </Provider>,
    document.getElementById('app')
)
