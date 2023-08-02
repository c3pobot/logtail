'use strict'
const path = require('path')
const log = require('logger')
const LOG_DIR = '/app/data'
const getPodFiles = require('./getPodFiles')
const fs = require('fs')
const { Tail } = require('tail')
const tails = {}
const getFiles = ()=>{
  return new Promise((resolve, reject)=>{
    fs.readdir(LOG_DIR, async(err, filenames)=>{
        if(err) {
          log.error(err)
          reject()
        }
        resolve(filenames)
      })
  })
}
const createTail = (fileName) =>{

  if(tails[fileName]) return
  console.log(fileName)
  tails[fileName] = new Tail(path.join(LOG_DIR, fileName), {nLines: 10})
  tails[fileName].on('line', (data)=>{
    let array = data?.split(' ')
    let timeStamp = array.shift()
    array.shift()
    array.shift()
    console.log(array.join(' '))
  })
  tails[fileName].on('error', async(error)=>{
    await tails[fileName].unwatch()
    delete tails[fileName]
  })
}
const getLogFile = (logs = [])=>{
  try{
    if(logs.length === 1) return logs[0]
    let num = 0
    for(let i in logs){
      let tempNum = logs[i].split('.')
      if(+tempNum[0] > num ) num = +tempNum[0]
    }
    return num+'.log'
  }catch(e){
    throw(e)
  }
}
const checkPod = async(pod = {})=>{
  try{
    if(!pod.containers) return
    for(let i in pod.containers){
      let logFileName = getLogFile(pod.containers[i].logs)
      let fileName = path.join(pod.podPath, pod.containers[i].name, logFileName)
      await createTail(fileName)
    }
  }catch(e){
    throw(e)
  }
}
const createTails = async(notify = false)=>{
  try{
    let files = await getPodFiles()
    if(files?.length > 0){
      let i = files.length
      while(i--){
        await checkPod(files[i])
      }
    }
    if(notify) log.info('Created '+files?.length+' tails...')
    setTimeout(createTails, 5000)
  }catch(e){
    log.error(e);
    setTimeout(createTails, 5000)
  }
}
createTails(true)
