//     Termgram
//     Copyright 2015 Enrico Stara 'enrico.stara@gmail.com'
//     Released under the MIT License
//     http://termgram.me

// import the dependencies
const fs = require('fs');
const util = require('util');
const fileResolver = /^\.(\w+)\.user$/;
let baseFolder = '.';

class UserData {
  constructor(data) {
    util._extend(this, data);
  }

  setDataCenter(dataCenter) {
    this.dataCenter = dataCenter;
  }

  getDataCenter() {
    return this.dataCenter;
  }

  setAuthKey(authKeyBuffer) {
    this.authKey = authKeyBuffer.toString('base64');
  }

  getAuthKey() {
    return this.authKey ? new Buffer(this.authKey, 'base64') : null;
  }

  save() {
    const filePath = `${baseFolder}/.node-telegram`;
    const ws = fs.createWriteStream(filePath);
    ws.write(JSON.stringify(this));
    ws.end();
  }

  static retrieveUsernameList() {
    let list = fs.readdirSync(baseFolder);
    list = list.map(function (value) {
        const match = value.match(fileResolver);
        return (match ? match[1] : null);
    }).filter(function (value) {
        return value
    });
    return list;
  }

  static isLoggin() {
    const filePath = `${baseFolder}/.node-telegram`;
    try {
      fs.accessSync(filePath, fs.F_OK);
      return true;
    } catch (e) {
      return false;
    }
  }

  static loadUser(username) {
    const filePath = `${baseFolder}/.node-telegram`;
    return new UserData(JSON.parse(fs.readFileSync(filePath)));
  }

  static setBaseFolder(folder) {
    baseFolder = folder;
  }
}


module.exports = UserData;
