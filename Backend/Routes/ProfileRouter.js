import express from 'express'
import { getLastSeen, getProfileVisiblity, getShowOnline, LastSeenVisibility, ProfileVisibility, SetOnlineOffLineStatus } from '../Controllers/ProfileSettings.js';


  const ProfileRouter = express.Router();
ProfileRouter.put("/profile/visibility/:userId/:isVisible", ProfileVisibility);
ProfileRouter.get("/profile/getvisibility/:userId", getProfileVisiblity);



//  lastseen msg route 
ProfileRouter.put("/message/lastseen/:userId/:isVisibleLastSeen" , LastSeenVisibility );
ProfileRouter.get("/message/getlastseen/:userId"  , getLastSeen);




//   let make show online or offline 
ProfileRouter.put("/setonline/:userId/:isOnline" ,SetOnlineOffLineStatus )
ProfileRouter.get("/onlineStatus/:userId" ,   getShowOnline);
  export default  ProfileRouter;