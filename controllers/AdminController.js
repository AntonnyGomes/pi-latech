const { validationResult } = require("express-validator");
const { Admin, User } = require("../database/models");
const bcrypt = require("bcrypt");

const AdminController = {

  main: async (req, res) => {
    
    res.render("mainAdmin");
  },


   
    signUp: (req, res) => {
      //let error = req.query.error ? 1 : 0;
      res.render("adminSignUp");
    },
  

    createAdmin: async (req, res) => {
        const resultValidations = validationResult(req);
        if (resultValidations.errors.length > 0) {
          return res.render("adminSignUp", {
            errors: resultValidations.mapped(),
            oldAdminData: req.body,
          });
      }

      let adminExists = await Admin.findOne({
        raw: true,
        where: {
          Email: req.body.emailAdmin,
        },
      });
      if (adminExists) {
        res.redirect("/admin/login");
      } else {
        const adminCreated = await Admin.create({
          Name: req.body.nameAdmin,
          Email: req.body.emailAdmin,
          WorkerId: req.body.workerAdmin,
          Password: bcrypt.hashSync(req.body.passwordAdmin, 10),
        });
        //console.log(req.body);
        //console.log(adminCreated);
        return res.redirect("/admin/login");
      }
    },

    adminLogin: (req, res) => {
    //   let error = "";
    //   if (req.query.error == 1) {
    //     error = "Senha ou email não conferem.";
    //   } else if (req.query.error == 2) {
    //     error = "Já existe um cadastro para esse email. Deseja fazer login?";
    //   }
      res.render("adminLogin");
    },
  
    adminLoginProcess: async (req, res) => {
      try {
        const adminToLogin = await Admin.findOne({
          raw: true,
          where: {
            Email: req.body.emailAdmin,
          },
        });
  
        let isPasswordVerified = bcrypt.compareSync(
          req.body.passwordAdmin,
          adminToLogin.Password
        );
  
        if (!adminToLogin) {
          return res.redirect("/admin");
        } else {
          if (!isPasswordVerified) {
            return res.redirect("/admin");
          } else {
            if (adminToLogin && isPasswordVerified) {
              
              delete adminToLogin.Password;
              req.session.adminLogged = adminToLogin;
              //console.log(req.session.adminLogged);
              //console.log(adminToLogin);
              }  
              
              if (req.body.remember_admin) {
                res.cookie("adminEmail", req.body.emailAdmin, {
                  maxAge: (1000 * 60) * 30
                });
              }
              if(!req.body.remember_admin){
                res.cookie("adminEmail", req.body.email, {
                  maxAge: (1000 * 60) * 5
  
              });
              }
  
                 res.redirect("/admin/panel");
              }
            }
      } catch (error) {
        return res.render("adminSignUp", {
          error:
            "Não existe cadastro para esse email, deseja realizar um cadastro?.",
        });
      }
    },

    adminEditUser: (req,res) =>{
      res.render("adminEditUser")
    },

    updateUser:  async (req,res) => {
      let userId = req.params.id;
      let user = await User.findByPk(userId);
  
      if(user)
      res.render("updateUser", { user });
      //console.log(user)
  
   },

    updateUserData:   async (req, res) => {
      let user =  await User.update(
       {
         Nome: req.body.name,
         Sobrenome: req.body.lastName,
         Email: req.body.email,
         Cpf: req.body.personal_id,
         Telefone: req.body.phone,
         Avatar: req.body.avatar,
       },

       {
         where:{
           idUser: req.params.id
         } 
       }
       )
     //   console.log(userLogged)
     //  console.log(req.body);
     //  console.log(req.params.id);
       return  res.redirect('/admin')
    },

     showAdminPanel: (req, res) => {
       res.render("adminPanel")
   },

   logoutAdmin: (req, res) => {
    req.session.destroy();
    res.clearCookie("AdminEmail");
    return res.redirect("/admin/index");
  },
}
module.exports = AdminController;