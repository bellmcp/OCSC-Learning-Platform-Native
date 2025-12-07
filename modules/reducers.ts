import { combineReducers } from 'redux'

import categories from './categories/reducer'
import courses from './courses/reducer'
import curriculums from './curriculums/reducer'
import learn from './learn/reducer'
import me from './me/reducer'
import otp from './otp/reducer'
import press from './press/reducer'
import registrations from './registrations/reducer'
import resetPassword from './reset-password/reducer'
import ui from './ui/reducer'
import user from './user/reducer'

export default () =>
  combineReducers({
    user,
    categories,
    courses,
    curriculums,
    learn,
    me,
    otp,
    press,
    registrations,
    resetPassword,
    ui,
  })
