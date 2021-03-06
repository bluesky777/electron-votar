require('dotenv').config();

db              = require('../connWeb');
//bcrypt          = require('bcrypt');
jwt             = require('jsonwebtoken');

ImagenModel     = require('./ImagenModel');



class User {
    
    
    static login(user_data) {

        


        let promesa = new Promise(function(resolve, reject){

         db.query('SELECT *, rowid FROM Participantes WHERE Username=?', [user_data.username]).then(function(result){

           

                if(result.length > 0){


                    let user = result[0];
                    console.log(user);
                  
                    let compatible = User.comparar(user_data.password, user.Password);

                   

                    if (! compatible) reject('invalid_password');

                    let token               = jwt.sign({ rowid: user.rowid }, process.env.JWT_SECRET);
                    user.remember_token     = token;
                    delete user.Password;

                    db.query('SELECT *, rowid FROM Votos WHERE Participante_id=?' , [user.rowid]).then(function(votos){
                        user.votos = votos;

                        resolve(user);
                    });


                }else{
                    reject('invalid_username')
                    
                }
                
            })

        });
        
        return promesa;
        
    }
    
    
    
    static comparar(Password, hash_password) {
        return (Password == hash_password);
        return bcrypt.compareSync(Password, hash_password);
    }
    
    
    static datos_usuario_logueado(user) {
        return new Promise((resolve, reject)=>{
            
            // Por ahora sólo le trae los roles, no los permisos
            User.roles_y_permisos(user).then((result)=>{
                let roles           = result;
                user.roles          = roles;
                
                return ImagenModel.imagen_de_usuario(user.sexo, user.imagen_id);
                
            }).then((nombre_img)=>{
                user.imagen_nombre  = nombre_img;
                resolve(user);
            });
            
        });
        
    }
    
    static roles_y_permisos(user) {
        return new Promise((resolve, reject)=>{
            let consulta = "SELECT r.* FROM roles r " +
                    "INNER JOIN role_user ru ON ru.role_id=r.id AND ru.user_id=?";
            db.query(consulta, [user.rowid]).then(function(result){
                let roles = result;
                resolve(roles);
            })
            
        });
        
    }
    
};

module.exports = User;

