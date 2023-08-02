'use strict'
const fs = require('fs')
const path = require('path')
const LOG_DIR = '/app/data'
const getFiles = (filePath)=>{
  return new Promise((resolve, reject)=>{
    fs.readdir(filePath, async(err, filenames)=>{
        if(err) {
          log.error(err)
          reject()
        }
        resolve(filenames)
      })
  })
}
const podFilter = ['slave-leia']
const getContiners = async(res = {})=>{
  try{
    let containers = await getFiles(path.join(LOG_DIR, res.podPath))
    for(let i in containers){
      res.containers[containers[i]] = { name: containers[i], logs: [] }
      res.containers[containers[i]].logs = await getFiles(path.join(LOG_DIR, res.podPath, containers[i]))
      res.containers[containers[i]].logs = res.containers[containers[i]].logs.filter(x=>x.endsWith('.log'))
    }
    return res
  }catch(e){
    throw(e)
  }
}
module.exports = async()=>{
  try{
    let tempPods = await getFiles(LOG_DIR)
    let array = [], pods = []
    for(let i in tempPods){
      for(let f in podFilter){
        if(tempPods[i].startsWith(podFilter[f])){
          pods.push(tempPods[i])
          break;
        }
      }
    }
    for(let i in pods){
      let tempArray = pods[i].split('_')

      let tempObj = await getContiners({ podPath: pods[i], namespace: tempArray[0], podName: tempArray[1], containers: {} })
      if(tempObj) array.push(tempObj)
    }
    return array
  }catch(e){
    console.error(e);
  }
}
