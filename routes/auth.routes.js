const {Router} = require('express');
const User = require('./models/User');
const jwt = require('jsonwebtoken');
const config = require('config');
const {check, validationResult} = require('express-validator');
const bcrypt = require ('bcrypt');
const router = Router();

router.post(
    '/register',
    [
      check('email','wrong email').isEmail(),
      check('password','min length=6')
      .isLength({min:6})
    ], 
   async (req, res) => {
        try {
            
            const errors = validationResult(req)
           
            if (!errors.isEmpty()){
                return res.status(400).json({
                    errors: errors.array(),
                    message: 'Wrong data'
                })
            }
            const { email, password } = req.body;
         
            const candidate = await User.findOne({ email });
            if (candidate) {
                return res.status(400).json({ message: 'User exist' });
            }
            const hashedPassword = await bcrypt.hash(password, 12);
            
            const user = new User({ email, password: hashedPassword });
          
            await user.save();

            res.status(201).json({ message: 'User is created' });
        }
        catch (e) {
            res.status(500).json({ message: e.message || 'Somethig went wrong' });
        }
    })
router.post(
    '/login',
    [
      check('email','wrong email').normalizeEmail().isEmail(),
      check('password','password is emply').exists()
    ], 
   async (req, res) => {
        try {
            const errors = validationResult(req)
            if (!errors.isEmpty()){
                return res.status(400).json({
                    errors: errors.array(),
                    message: 'Wrong data'
                })
            }

            const {email,password} = req.body

            const user = await User.findOne({email})

            if(!user){
                return res.status(400).json({message:'user is not exist'})
            }
              
            const isMatch = await bcrypt.compare(password,user.password);
            
            if (!isMatch){
                return res.status(400).json({message:'wrong password'})
            }

            const token = jwt.sign(
                { userID: user.id },
                config.get('jwtSecret'),
                { expiresIn: '1h' }
            )

            res.json({ token, userID:user.id })
           
        }
        catch (e) {
            res.status(500).json({ message: e.message || 'Somethig went wrong' });
        }
    })
module.exports = router 