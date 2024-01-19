import React, { useEffect } from "react";
import { useAuth0 } from "@auth0/auth0-react";

const Profile = () => {
  const { user, isAuthenticated, isLoading, getAccessTokenSilently } = useAuth0();

  if (isLoading) {
    return <div>Loading ...</div>;
  }

  let profileData = (<div></div>);
  useEffect(() => {
    const getUserMetadata = async () => {
      try {
        const accessToken = await getAccessTokenSilently();
        if (accessToken) {
          console.log("got access token");
          // TODO: Store cookie securely with HttpOnly and/or Secure settings
          document.cookie = `afc_app=${accessToken}; SameSite=Lax`;
        } else {
          console.error("didn't get access token")
        }
        
      } catch (e: any) {
        console.log(e.message);
      }
    };
  
    getUserMetadata();
  }, [getAccessTokenSilently, user?.sub]);

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