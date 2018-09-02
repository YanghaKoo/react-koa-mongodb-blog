require('dotenv').config();

const Koa = require('koa')
const Router = require('koa-router')
const bodyParser = require('koa-bodyparser')

const api = require('./api')

const app = new Koa()
const router = new Router()


const mongoose = require('mongoose')
const {
  PORT : port=4000,
  MONGO_URI : mongoURI
} = process.env

// mongoDB와 연결하는 부분
mongoose.Promise = global.Promise // Node의 Prosie를 사용하도록 설정
mongoose.connect(mongoURI)
  .then(()=>{ console.log('connected to mongodb') })
  .catch((e)=>{ console.log(e) })


  
// 이 부분이 /api로 시작하는 주소를 분기하는 방법
// 분기하려면 분기할 폴더(파일)을 가져온 후 그거.routes()를 use의 2번째인자로 주면됨
router.use('/api', api.routes());


app.use(bodyParser())
// app 인스턴스에 라우터 적용? 이건 최상위에 있는 app.use에만 연결하면 됨
app.use(router.routes()).use(router.allowedMethods())

app.listen(port,()=>{
  console.log('listeng to ', port)
})