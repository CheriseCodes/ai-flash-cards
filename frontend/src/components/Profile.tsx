import React from "react";
import { useAuth0 } from "@auth0/auth0-react";

const Profile = () => {
  const { user, isAuthenticated, isLoading, getAccessTokenSilently } = useAuth0();

  if (isLoading) {
    return <div>Loading ...</div>;
  }

  let profileData = (<div></div>);
  // console.log(getAccessTokenSilently());
  if (user) {
    profileData = (
        <div>
          <img src={user.picture} alt={user.name} />
          <h2>{user.name}</h2>
          <p>{user.email}</p>
        </div>
      )
  }
  return <>{isAuthenticated && profileData}</>
};

export default Profile;