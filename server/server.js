
// first, remove configuration entry in case service is already configured

ServiceConfiguration.configurations.remove({
  service: "google"
});

ServiceConfiguration.configurations.remove({
  service: "facebook"
});

ServiceConfiguration.configurations.upsert(
  { service: "google" },
  { $set: { clientId: "",
   secret: "" } 
 }
);
ServiceConfiguration.configurations.upsert(
  { service: "facebook" },
  { $set: { appId: "",
   secret: "" } 
 }
);

Accounts.onCreateUser(function(options, user) {
  var roles = options.profile.roles;
  user.roles = [roles];
  // We still want the default hook's 'profile' behavior.
  if (options.profile)
    user.profile = options.profile;
  return user;
});