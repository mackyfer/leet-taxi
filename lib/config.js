AccountsTemplates.removeField('email');
AccountsTemplates.addFields([
  {
      _id: "username",
      type: "text",
      displayName: "username",
      required: true,
      minLength: 5,
  }
]);
AccountsTemplates.removeField('password');
AccountsTemplates.addField({
    _id: 'password',
    type: 'password',
    required: true,
    minLength: 6,
    errStr: 'At least minimum length of 6 character required.'
});
AccountsTemplates.configure({
    texts: {
          title:{
            signIn: "Login",
            signUp: "Sign Up"
          },
          button:{

          signIn: "Login",
          signUp: "Sign Up"

          },
          inputIcons: {
          isValidating: "fa fa-spinner fa-spin",
          hasSuccess: "fa fa-check",
          hasError: "fa fa-times",
          }
        },

      showPlaceholders: true,
      showLabels: false,
      });



AccountsTemplates.addField({
    _id: 'roles',
    type: 'radio',
    required: true,
    select:[{text:"Passenger", value:"call-cab"},{text:"Driver", value:"view-cab-requests"}]
});



