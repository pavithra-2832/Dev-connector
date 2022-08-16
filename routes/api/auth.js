const express =require ('express');
const router =express.Router();
const bcrypt = require('bcryptjs');
const auth =require('../../middleware/auth');
const jwt = require('jsonwebtoken');
const config = require('config');
const {check, validationResult} = require('express-validator');


const User = require('../../models/User');
//@route GET api/auth

router.get('/',auth,async(req,res) => {
    try{
        const user= await User.findById(req.user.id).select('-password');
        res.json(user);

    }catch(err){
        console.error(err.message);
        res.status(500).send('Server error');

    }
});

//@route POST api/auth
//desc Authenticate user and get token
router.post('/',[
    
    check('email','Please include valid email').isEmail(),
    check('password','Please is required').exists()
],
async(req,res) => {
    

    const errors =validationResult(req);
    if(!errors.isEmpty())
    {
        return res.status(400).json({errors:errors.array()});
    }

    const{email,password}=req.body;
    try{
        //see if user exists

        let user =await User.findOne({email});
        if(!user){

            return res
            .status(400)
            .json({errors:[{msg:'Invalid credentials'}]});

        }
        const isMatch =await bcrypt.compare(password,user.password);
        if(!isMatch){
            return res
            .status(400)
            .json({errors:[{msg:'Invalid credentials'}]});

        }

      
        
        const payload = {
            user:{
                id: user.id
            }
        };

        const token =jwt.sign(
            payload,
            config.get('jwtSecret'),
            {expiresIn: '5 days'}
            /*(err,token) => {
                if(err) throw err;
                re.json({token});
            }*/
            );
            res.status(200).json({
                message:"Auth success",
                token:token
            })

    }
    catch(err){

        console.error(err.mesaage);
        res.status(500).send('Server error');

    }
    
    

});

module.exports =router;
