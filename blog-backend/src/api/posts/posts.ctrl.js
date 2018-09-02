const Post = require('models/post')
const { ObjectId } = require('mongoose').Types
const Joi = require('joi')

exports.checkObjectId = (ctx,next)=>{
  const {id} = ctx.params

  // 검증 실패한다면 
  if(!ObjectId.isValid(id)){
    ctx.state = 400; // 400 Bad Request
    return null
  }
  return next()
}

// 포스트 작성
// POST  /api/posts {title, body}
exports.write = async (ctx) => {
  
  const schema = Joi.object().keys({
    title : Joi.string().required(),
    body : Joi.string().required(),
    tags : Joi.array().items(Joi.string()).required()
  })

  const result = Joi.validate(ctx.request.body, schema)
  if(result.error){
    ctx.status = 400,
    ctx.body = result.error;
    return;
  }

  const { title, body, tags } = ctx.request.body

  const post = new Post({
    title, body , tags
  })

  try {
    await post.save()
    ctx.body = post;
  } catch(e){
    ctx.throw(e,500)
  }
}

// 포스트 목록 조회 
// GET /api/posts/
exports.list = async (ctx) => {
  const page = parseInt(ctx.query.page || 1)    // 쿼리가 없다면 기본적으로 1page

  if(page<1){
    ctx.status = 400;
    return
  }
   
  // 데이터를 조회할때는 .find() , .lean()을 사용하면 노말한 json객체로 받아올 수 있음
  try {
    const posts = await Post.find().sort({_id: -1}).limit(10).skip((page-1)*10).lean().exec();
    const postCount = await Post.count().exec()
    

    const limitBodyLength = post => ({
      ...post,
      body : post.body.length < 200 ? post.body : `${post.body.slice(0,200)}...`
    })
    ctx.body = posts.map(limitBodyLength)
    
    // Last-Page라는 커스텀 HTTP 헤더 삽입, 마지막  페이지의 넘버 알려줌
    ctx.set('Last-Page', Math.ceil(postCount /10 ))
  }catch(e){
    ctx.throw(e,500)
  }
}

// 특정 포스트 조회
// GET /api/posts/:id
exports.read = async (ctx) => {
  const {id} = ctx.params
  try{
    const post = await Post.findById(id).exec();
    if(!post){
      ctx.status = 404;
      return
    }
    ctx.body = post
  }catch(e){
    ctx.throw(e,500)
  }
}

// 특정 포스트 제거
// DELETE /api/posts/:id
exports.remove = async (ctx) => {
  const {id} = ctx.params
  try{
    await Post.findByIdAndRemove(id).exec()
    ctx.status = 204
  }catch(e){
    ctx.throw(e,500)
  }
}


// 포스트 수정
// PATCH /api/posts/:id
exports.update = async (ctx) => {
  const {id} = ctx.params
  try{
    const post = await Post.findByIdAndUpdate(id,ctx.request.body, {
      new : true      // 이 값을 설정해야 바뀐 객체를 반환함
    }).exec()
    if(!post){
      ctx.status = 404;
      return
    }
    ctx.body = post
  }catch(e){
    ctx.throw(e,500)
  }
}