import createRootReducer from '@/modules/reducers'
import { applyMiddleware, createStore } from 'redux'
import { thunk } from 'redux-thunk'

function configureStore(initialState?: any) {
  const middleware = [thunk]

  const store = createStore(
    createRootReducer(),
    initialState,
    applyMiddleware(...middleware)
  )

  return store
}

export default configureStore
