
// first, remove configuration entry in case service is already configured

ServiceConfiguration.configurations.remove({
  service: "google"
});

ServiceConfiguration.configurations.remove({
  service: "facebook"
});

ServiceConfiguration.configurations.upsert(
  { service: "google" },
  { $set: { clientId: "894664398562-iqsf424chsve4bf717nm087er0dfcuen.apps.googleusercontent.com",
   secret: "Pn7K_-vWXCqJXap5nag8V354" } 
 }
);
ServiceConfiguration.configurations.upsert(
  { service: "facebook" },
  { $set: { appId: "1529271974063364",
   secret: "9f9c8251ff0ea46db272e80035d8c9cb" } 
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