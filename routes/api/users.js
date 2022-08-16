const express =require ('express');
const router =express.Router();
const gravatar =require('gravatar');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const config = require('config');
const {check, validationResult} = require('express-validator');

const User =require('../../models/User');
//@route POST api/users
//desc register user
router.post('/',[
    check('name','Name is required')
    .not()
    .isEmpty(),
    check('email','Please include valid email').isEmail(),
    check('password','Please enter a password with 6 or more characters').isLength({min:6})
],
async(req,res) => {
    

    const errors =validationResult(req);
    if(!errors.isEmpty())
    {
        return res.status(400).json({errors:errors.array()});
    }

    const{name,email,password}=req.body;
    try{
        //see if user exists

        let user =await User.findOne({email});
        if(user){

            return res.status(400).json({errors:[{msg:'User already exists'}]});

        }
        //Get user gravatar
        const avatar =gravatar.url(email,{
            s:'200',
            r:'pg',
            d:'mm'
        })

        user = new User({
            name,
            email,
            avatar,
            password
        });
        //Encrpt password
        const salt = await bcrypt.genSalt(10);

        user.password = await bcrypt.hash(password,salt);

        await user.save();
        
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