const constants = {
  PATTERN_IMPORTS: 'imports',
  PATTERN_IMPORTS_REDUX_TO_INDEX: 'imports_redux_to_index',
  PATTERN_IMPORTS_SAGA_TO_INDEX: 'imports_saga_to_index',
  PATTERN_SAGA_ACTION: 'saga_action',
  PATTERN_ROUTES: 'routes'
}

module.exports = {
  constants,
  [constants.PATTERN_IMPORTS]: `import[\\s\\S]*from\\s+'react-navigation';?`,
  [constants.PATTERN_IMPORTS_REDUX_TO_INDEX]: 'export const reducers = combineReducers',
  [constants.PATTERN_IMPORTS_SAGA_TO_INDEX]: '------------- Sagas -------------',
  [constants.PATTERN_SAGA_ACTION]: '// some sagas only receive an action',
  [constants.PATTERN_ROUTES]: 'const PrimaryNav',

}
