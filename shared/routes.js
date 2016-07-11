Router.onBeforeAction(function() {
  GoogleMaps.load({
    key: 'AIzaSyDvHRa-ztBgMcI6muBwBS2-FJdP9PWKlPg',
    libraries: 'places'
  });
  this.next();
}, { only: ['/'] });

Router.configure({
    layoutTemplate: 'Master',
    loadingTemplate: 'Loading'
});

Router.route('home',{
  path:'/',
  template:'Home',
  onBeforeAction: function () {

    if (Meteor.user()) {
      var roles = Meteor.user().roles
      if(roles){
        if(roles.indexOf("view-cab-requests")> -1)
        {
          Router.go('cab-requests');
        }

        if(roles.indexOf("call-cab")> -1)
        {
          Router.go('/callcab');
        }
      }
    }else{
      this.next();
    }
  }
});

Router.route('/profile/:_id', function () {
  if (!Meteor.user()) {Router.go('home');}
  this.render('UserProfileEdit');
});

Router.route('/callcab', {onBeforeAction:function () {
   if (!Meteor.user()) {Router.go('home');}
  var reqDetails = CabRequest.find({requested_by:Meteor.userId(), status:1},{fields:{from:1, to:1, requested_by:1,eta:1,driver:1, createdAt:1, first_name:1}}).count();
  
  if(reqDetails > 0){
    Router.go('/myrequest');
  }

    this.render('CallCab');
}});

Router.route('/myrequest', function () {
  var reqDetails = CabRequest.find({requested_by:Meteor.userId(), status:1},{fields:{from:1, to:1, requested_by:1,eta:1,driver:1, createdAt:1, first_name:1}}).count();
  
   if (!Meteor.user()) {Router.go('home');}
   if(reqDetails <= 0){
      Router.go('/callcab');
   }

  this.render('MyRequest');
});

Router.route('cab-requests', 
  {
    path:"/cab-requests", 
    onBeforeAction:function () {
    if (!Meteor.user()) {Router.go('home');}
      this.render('CabRequests');
    }
  });


Router.route('message', 
  {
    path:"/message/:_id/:request_id", 
    template:'Message',
    onBeforeAction:function () {
    if (!Meteor.user()) {Router.go('home');}else{
      
      //console.log(this.params.request_id);
      this.next();
    }
    }
  });