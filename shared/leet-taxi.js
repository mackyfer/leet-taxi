CabRequest = new Mongo.Collection("CabRequest");
ChatLog = new Mongo.Collection("ChatLog");

if (Meteor.isServer) {
    Meteor.publish("request_details", function() {
        return CabRequest.find();
    });

    Meteor.publish("chat_data", function() {
        return ChatLog.find();
    });


    Meteor.methods({
        'completeRequest':function(request_id){
           if (!Meteor.userId()) {
                throw new Meteor.Error("not-authorized");
            }
            CabRequest.update(request_id, {$set:{status:999}});
        },
        'requestCab': function(data) {

            if (!Meteor.userId()) {
                throw new Meteor.Error("not-authorized");
            }

            var name;
            try {
                var fullname = Meteor.user().profile.name;
                var firstname = fullname.split(" ");
                name = firstname[0];
            } catch (e) {
                name = Meteor.user().username;
            }



            CabRequest.insert({
                from: data.from,
                to: data.to,
                requested_by: Meteor.userId(),
                first_name: name,
                eta: null,
                status: 1,
                createdAt: new Date()
            }, function() {

            });


        },
        'updateETA': function(data) {
            if (!Meteor.userId()) {
                throw new Meteor.Error("not-authorized");
            }
            CabRequest.update(data._id, {
                $set: {
                    eta: data.eta,
                    driver: data.driver
                }
            });
        },
        'cancelRequest': function(id) {
            CabRequest.update(id, {
                $set: {
                    status: 0
                }
            });
        },
        'sendMessage': function(data) {
            ChatLog.insert({
                from: data.from,
                to: data.to,
                message: data.message,
                time_sent: data.time_sent,
                request_id: data.request_id,
                read_status:0
            }, function() {

            });

        },
        'findUserByUsername': function(uname) {

            var data = Meteor.users.findOne({
                username: uname
            });
            return data;

        },
        'findUserById': function(user_id) {

            var data = Meteor.users.findOne({
                _id: user_id
            });
            return data;

        },
        'updateReadStatus':function(id){
          return ChatLog.update({request_id:id, to:this.userId, read_status:0},{ $set: {
                    read_status: 1
                }},{multi:true});
          
        }



    });


}

if (Meteor.isClient) {

    Template.Master.onRendered(function() {
        this.$('.button-collapse').sideNav({
            closeOnClick: true
        });
    });

    Template.MessageLog.onRendered(function(){
      var objDiv = document.getElementById("msgs_passenger_out");
      objDiv.scrollTop = objDiv.scrollHeight;
    });

    Template.MessageLog.helpers({
        'userNameFromId': function(user_id) {
            if (user_id == Meteor.userId()) {

                return "Me";
            } else {

                Meteor.call('findUserById', user_id, function(err, data) {
                    if (!err) {
                        Session.set('chatusr', data);
                    } else {
                        console.log(err);
                    }


                });

                if (Session.get('chatusr').profile.name) {
                    return Session.get('chatusr').profile.name;
                } else {
                    return Session.get('chatusr').username;
                }
            }
        }

    });
    Template.CallCab.onRendered(function() {
        if (GoogleMaps.loaded()) {
            $("#auto_from").geocomplete();
            $("#auto_to").geocomplete();
        }
    });

    AutoForm.addHooks(['UserProfileEdit'], {
        onSuccess: function(operation, result, template) {
            sAlert.success('Profile Updated.', {
                effect: 'slide',
                position: 'bottom',
                stack: false
            });
        }
    });

    /********** subscriptions ***********/
    Meteor.subscribe("request_details");
    Meteor.subscribe("chat_data");
    /************************************/

    Template.Master.helpers({
        screenName: function() {
            if (Meteor.user().profile.name) {
                return Meteor.user().profile.name;
            } else {
                return Meteor.user().username;
            }
        }

        ,
        messageAlert:function()
        {
            var query = ChatLog.find({to:Meteor.userId(), read_status:0});
            var handle = query.observeChanges({
              added: function (id, chat_log) {
                
                var u = Meteor.call("findUserById", chat_log.from, function(){

                    console.log("You have unread messages");
                });

                
              }
            });
        }

    });

    Template.registerHelper('timeAgo', function(date) {
        var seconds = Math.floor((new Date() - date) / 1000);

        var interval = Math.floor(seconds / 31536000);

        if (interval > 1) {
            return interval + " years";
        }
        interval = Math.floor(seconds / 2592000);
        if (interval > 1) {
            return interval + " months";
        }
        interval = Math.floor(seconds / 86400);
        if (interval > 1) {
            return interval + " days";
        }
        interval = Math.floor(seconds / 3600);
        if (interval > 1) {
            return interval + " hours";
        }
        interval = Math.floor(seconds / 60);
        if (interval > 1) {
            return interval + " minutes";
        }
        return Math.floor(seconds) + " seconds";
    });



    Template.RequestDetail.helpers({
        request_details: function() {
            return CabRequest.find({
                status: 1
            }, {
                fields: {
                    from: 1,
                    to: 1,
                    requested_by: 1,
                    eta: 1,
                    driver: 1,
                    createdAt: 1,
                    first_name: 1
                }
            });
        },
        onJob: function() {
            var jobCount = CabRequest.find({
                driver: Meteor.user().username,
                status: 1
            }).count();
            if (jobCount > 0) {
                return true;
            }

            return false;
        },
        'unreadMessages':function(req_id)
        {

          return ChatLog.find({to:Meteor.userId(), request_id:req_id, read_status:0}).count();
        }
    });

    Template.MyRequestDetail.helpers({
        request_details: function() {
            return CabRequest.find({
                requested_by: Meteor.userId(),
                status: 1
            }, {
                fields: {
                    from: 1,
                    to: 1,
                    requested_by: 1,
                    eta: 1,
                    driver: 1,
                    createdAt: 1,
                    first_name: 1
                }
            });
        },
        
        'unreadMessages':function(req_id)
        {

          return ChatLog.find({to:Meteor.userId(), request_id:req_id, read_status:0}).count();
        },

        chatToUserId: function(uname) {
            Meteor.call('findUserByUsername', uname, function(err, data) {
                if (!err) {
                    Session.set('sUserId', data);
                } else {
                    console.log(err);
                }


            });
            return Session.get('sUserId')._id;
        },
        chatToUserName: function(uname) {
            Meteor.call('findUserByUsername', uname, function(err, data) {
                if (!err) {
                    //alert("hi world data: "+ data);
                    Session.set('sUserId', data);

                } else {
                    console.log(err);
                }


            });

            if (Session.get('sUserId').profile.name) {
                return Session.get('sUserId').profile.name;
            } else {
                return Session.get('sUserId').username;
            }
        }




    });

    Template.Message.helpers({
        chat_to: function() {
            return Router.current().params._id;
        },
        request_id: function() {
            return Router.current().params.request_id;
        }
    });

    Template.MessageLog.helpers({
        chat_details: function() {
            Meteor.call('updateReadStatus',Router.current().params.request_id);
            return ChatLog.find({
                request_id: Router.current().params.request_id
            });
            
            
        },
        chatClass:function(userId){
          var chatLog;
          chatLog = ChatLog.findOne({from:userId});
          if(chatLog.from == Meteor.userId())
            return "chat-my-chat";
          else
            return "chat-your-chat";

        }

    });


    Template.Master.events({

        'click .logout-link': function() {
            Meteor.logout();

        }


    });

    Template.CallCab.events({
        'submit form': function(event) {
            event.preventDefault();
            var to = event.target.to.value;
            var from = event.target.from.value;
            var data = {
                to: to,
                from: from
            };
            Meteor.call("requestCab", data);
        }

    });


    Template.Message.events({
        'click #send_msg_to_driver': function(e) {
            e.preventDefault();
            var msg = document.getElementById('msg_pass_input').value;
            var sendto = document.getElementById('mydriver').value;
            var requestId = document.getElementById('request_id').value;
            //console.log(e);
            var data = {
                from: Meteor.userId(),
                to: sendto,
                message: msg,
                request_id: requestId,
                time_sent: new Date()
            };
            if (msg.length > 0) {
                document.getElementById('msg_pass_input').value = '';
                Meteor.call("sendMessage", data,function(){
                         var objDiv = document.getElementById("msgs_passenger_out");
                         objDiv.scrollTop = objDiv.scrollHeight;

                    });
                //updateScroll("msgs_passenger_out");
                
            }
        },

        'keypress #msg_pass_input': function(e) {
            if (e.which === 13) {
                e.preventDefault();
                var msg = document.getElementById('msg_pass_input').value;
                var sendto = document.getElementById('mydriver').value;

                var requestId = document.getElementById('request_id').value;
                //console.log(e);
                var data = {
                    from: Meteor.userId(),
                    to: sendto,
                    message: msg,
                    request_id: requestId,
                    time_sent: new Date()
                };
                if (msg.length > 0) {
                    document.getElementById('msg_pass_input').value = '';
                    Meteor.call("sendMessage", data, function(){
                         var objDiv = document.getElementById("msgs_passenger_out");
                         objDiv.scrollTop = objDiv.scrollHeight;

                    });
                }
            }
        }

    });



    Template.CallCab.helpers({
        myRequest: function() {
            var reqcount = CabRequest.find({
                requested_by: Meteor.userId(),
                status: 1
            }).count();
            if (reqcount > 0) {
                return true;
            }
            return false;
        }
    });

    Template.RequestDetail.events({
        'click #accept_job': function(e) {
            e.preventDefault();
            var res = prompt("What is your Estimated Time of arrival?");
            var id;
            var data;
            if (res === null) {
                //alert("Prompt dismissed");                              
            } else {
                id = this._id;
                data = {
                    _id: id,
                    eta: res,
                    driver: Meteor.user().username
                };
                Meteor.call("updateETA", data);
                //alert();                        
            }
            //alert("hello");
        }
    });

    Template.MyRequestDetail.events({
        'click #cancel_request': function(e) {
            e.preventDefault();
            var c = confirm("Are you sure you want to cancel the request?");
            if (c == true) {
                Meteor.call("cancelRequest", this._id);
            }
        },
        'click #complete_request':function(e){
          e.preventDefault();
            var c = confirm("Confirming your ride was completed sucessfully...");
            if (c == true) {
                Meteor.call("completeRequest", this._id);
                sAlert.success('Thank you for using Elite Taxi App. We look forawrd to your next Ride Request', {
                effect: 'slide',
                position: 'bottom',
                stack: false
            });
            }
        }

    });
}


