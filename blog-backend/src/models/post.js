// 이게 일종의 table을 정의한거고,
// 이 테이블에 접근하려면 예를 require해서 써야해

const mongoose = require('mongoose')
const { Schema } = mongoose

const Post = new Schema({
  title : String,
  body : String,
  tags : [String], // 문자열 배열
  publishedDate : { 
    type : Date,
    default : new Date()  // 현재 날짜를 기본값으로 지정
  }
})

module.exports = mongoose.model('Post',Post)  // 모델 생성, 실제 mongodb엔 posts로 넘어감