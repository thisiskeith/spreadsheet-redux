import 'babel-polyfill'
import App from './containers/App'
import configureStore from './store/configureStore'
import React from 'react'
import { Provider } from 'react-redux'
import { render } from 'react-dom'

const store = configureStore()

render(
    <Provider store={store}>
        <App />
    </Provider>,
    document.getElementById('app')
)
