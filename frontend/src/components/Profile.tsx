import React, { useEffect } from "react";
import { useAuth0 } from "@auth0/auth0-react";

const Profile = () => {
  const { user, isAuthenticated, getAccessTokenSilently, logout } = useAuth0();

  let profileData = (<div></div>);
  useEffect(() => {
    const getUserMetadata = async () => {
      if (process.env.NODE_ENV !== "test") {
          if (isAuthenticated) {
          try {
            
              await getAccessTokenSilently();
              getUserMetadata();
          } catch {
            console.log(`getAccessTokenSilently failed`)
          }
        }
    }
}}, [])

  if (user) {
    profileData = (
        <div>
          <img src={user.picture} alt={user.name} />
          <h2>{user.name}</h2>
          <p>{user.email}</p>
          <button onClick={() => logout({ logoutParams: { returnTo: window.location.origin }})}> Logout</button>
        </div>
      )
  }
  return <>{isAuthenticated && profileData}</>
};

export default Profile;