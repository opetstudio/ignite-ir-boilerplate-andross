// @cliDescription  Generates a redux smart component.

const patterns = require('../lib/patterns')

module.exports = async function (context) {
  // grab some features
  const { parameters, strings, print, ignite, filesystem } = context
  const { pascalCase, isBlank, lowerCase, upperCase } = strings
  
  const config = ignite.loadIgniteConfig()
  const name = pascalCase(parameters.first)
  const initCapName = name
  const sagaName = name
  const reduxName = name
  const lowerName = lowerCase(parameters.first)
  const upperName = upperCase(parameters.first)
  const containerName = name

  const sourceFolderName = 'src'
  const containerFolderName = 'containers'
  const sagaTemplate = 'crud-saga-v1.ejs'
  const sagaTestTemplate = 'crud-saga-test-jest-v1.ejs'
  const reduxTemplate = 'crud-redux-v1.ejs'
  const reduxTestTemplate = 'crud-redux-test-jest-v1.ejs'
  const apiTemplate = 'crud-api-v1.ejs'
  const apiTestTemplate = 'crud-api-test-jest-v1.ejs'
  const containerTemplate = 'crud-container-v1.ejs'

  // PATH

  // path of container index files
  const containerFileIndexPath = `${process.cwd()}/${sourceFolderName}/${containerFolderName}/${name}/index.js`
  
  // path of service api file
  const apiFilePath = `${process.cwd()}/${sourceFolderName}/Services/Api.js`

  // path of service fixture file
  const fixtureFilePath = `${process.cwd()}/${sourceFolderName}/Services/FixtureApi.js`

  // path of navigation file
  const appNavFilePath = `${process.cwd()}/${sourceFolderName}/Navigation/AppNavigation.js`

  // path of redux index file
  const indexFilePath = `${process.cwd()}/${sourceFolderName}/Redux/index.js`
  
  // path of saga index
  const indexSagaFilePath = `${process.cwd()}/${sourceFolderName}/Sagas/index.js`

  // const crudToAdd = `  const get${initCapName} = data => api.get('${lowerName}s/' + data.id )`
  
  // IMPORT
  
  // import container into navigation
  const importToAdd = `import ${containerName} from '../${containerFolderName}/${containerName}'`
 
  // import saga into saga index
  const importSagaToAdd = `import { post${sagaName}, get${sagaName}s, get${sagaName}, update${sagaName}, remove${sagaName} } from '../${containerFolderName}/${name}/sagas'`
  
  // import redux into saga index
  const importReduxToAdd = `import { ${reduxName}Types } from '../${containerFolderName}/${name}/redux'`
 
  
  // PUT

  // put redux into combine reducer
  const toAdd = ` ${lowerName}: require('../${containerFolderName}/${name}/redux').reducer,`

  // put container into navigation root
  const routeToAdd = `${containerName}: { screen: ${containerName} },`
  
  // api crud function
  const crudApiToAdd = `
  const get${initCapName} = data => api.get('${lowerName}s/' + data.id )
  const post${initCapName} = data => api.post('${lowerName}s/', { ${lowerName}: data })
  const update${initCapName} = data => api.patch('${lowerName}s/' + data.id, { ${lowerName}: data })
  const remove${initCapName} = data => api.delete('${lowerName}s/' + data.id )
  const get${initCapName}s = data => api.get('${lowerName}s/')`
  
  // api export function crud
  const crudApiConsts = `
    get${initCapName},
    get${initCapName}s,
    post${initCapName},
    update${initCapName},
    remove${initCapName},`

  // fixture export function crud
  const crudFixtureConsts = `
  post${sagaName}: () => { return { ok: true, data: '21' } },
  get${sagaName}: () => { return { ok: true, data: '21' } },
  get${sagaName}s: () => { return { ok: true, data: '21' } },
  update${sagaName}: () => { return { ok: true, data: '21' } },
  remove${sagaName}: () => { return { ok: true } },`


  // validation
  if (isBlank(parameters.first)) {
    print.info(`${context.runtime.brand} generate container <name>\n`)
    print.info('A name is required.')
    return
  }
  if (filesystem.exists(containerFileIndexPath)) {
    const msg = `'${containerFileIndexPath}' is already exist.  Can't create new container.`
    print.error(msg)
    return
  }
  if (!filesystem.exists(indexFilePath)) {
    const msg = `No '${indexFilePath}' file found.  Can't add to index.js.`
    print.error(msg)
    return
  }

  
  const props = { name, lowerName }

  const jobs = [
    {
      template: containerTemplate,
      target: `${sourceFolderName}/${containerFolderName}/${name}/index.js`
    },
    {
      template: reduxTemplate,
      target: `${sourceFolderName}/${containerFolderName}/${name}/redux.js`
    },
    {
      template: sagaTemplate,
      target: `${sourceFolderName}/${containerFolderName}/${name}/sagas.js`
    },
    {
      template: apiTemplate,
      target: `${sourceFolderName}/${containerFolderName}/${name}/api.js`
    }
    // {
    //   template: 'container-style.ejs',
    //   target: `${sourceFolderName}/${containerFolderName}/${name}/styles.js`
    // }
  ]

  jobs.push({
      template: reduxTestTemplate,
      target: `${sourceFolderName}/${containerFolderName}/${name}/Tests/reduxTest.js`
  })
  jobs.push({
    template: sagaTestTemplate,
    target: `${sourceFolderName}/${containerFolderName}/${name}/Tests/sagaTest.js`
  })
  jobs.push({
    template: apiTestTemplate,
    target: `${sourceFolderName}/${containerFolderName}/${name}/Tests/apiTest.js`
  })

  await ignite.copyBatch(context, jobs, props)

  // insert redux require
  ignite.patchInFile(indexFilePath, {
    after: patterns[patterns.constants.PATTERN_IMPORTS_REDUX_TO_INDEX],
    insert: toAdd
  })

  // insert saga import
  ignite.patchInFile(indexSagaFilePath, {
    after: patterns[patterns.constants.PATTERN_IMPORTS_SAGA_TO_INDEX],
    insert: importSagaToAdd
  })

  ignite.patchInFile(indexSagaFilePath, {
    after: patterns[patterns.constants.PATTERN_SAGA_ACTION],
    insert: `    takeLatest(${sagaName}Types.${upperName}_REQUEST, get${sagaName}, api),
    takeLatest(${sagaName}Types.${upperName}_ALL, get${sagaName}s, api),
    takeLatest(${sagaName}Types.${upperName}_ATTEMPT, post${sagaName}, api),
    takeLatest(${sagaName}Types.${upperName}_UPDATE, update${sagaName}, api),
    takeLatest(${sagaName}Types.${upperName}_REMOVE, remove${sagaName}, api),`
  })

  ignite.patchInFile(fixtureFilePath, {
    after: '// Functions return fixtures',
    insert: `
    post${sagaName}: () => { return { ok: true, data: '21' } },
    get${sagaName}: () => { return { ok: true, data: '21' } },
    get${sagaName}s: () => { return { ok: true, data: '21' } },
    update${sagaName}: () => { return { ok: true, data: '21' } },
    remove${sagaName}: () => { return { ok: true } },`
  })

  // ignite.patchInFile(apiFilePath, {
  //   after: '// Define API Constants',
  //   insert: crudApiToAdd
  // })

  ignite.patchInFile(apiFilePath, {
    after: '// merge api',
    insert: `apiMerged = merge(apiMerged, require('../${containerFolderName}/${name}/api').create(api))`
  })

  // insert saga import
  ignite.patchInFile(indexSagaFilePath, {
    after: '------------- Types -------------',
    insert: importReduxToAdd
  })

  // if using `react-navigation` go the extra step
  // and insert the container into the nav router
  if (config.navigation === 'react-navigation') {
    if (!filesystem.exists(appNavFilePath)) {
      const msg = `No '${appNavFilePath}' file found.  Can't insert container.`
      print.error(msg)
      process.exit(1)
    }

    // insert container import
    // ignite.patchInFile(appNavFilePath, {
    //   after: patterns[patterns.constants.PATTERN_IMPORTS],
    //   insert: importToAdd
    // })

    // insert container route
    // ignite.patchInFile(appNavFilePath, {
    //   after: patterns[patterns.constants.PATTERN_ROUTES],
    //   insert: routeToAdd
    // })
  } else {
    print.info('Container created, manually add it to your navigation')
  }
}
