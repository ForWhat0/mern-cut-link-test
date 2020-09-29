const jwt = require('jsonwebtoken')
const config = require('config')
module.exports = (req,res,next)=>{
        if (req.method === "OPTIONS"){
            return next()
        }
        try{
          const headersToken = req.headers.authorization
          const token = headersToken.substr(headersToken.indexOf(' ')+1)
        
          if (!token){
            return  res.status(401).json({message:'no authorization'})          
          }
        const jwtSecret = config.get('jwtSecret')
         
          const decode = jwt.verify(token, jwtSecret)

          req.user = decode
          next()
        }
        catch(e){
            res.status(401).json({message:e.message})
        }
}