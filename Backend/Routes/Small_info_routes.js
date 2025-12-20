import express from 'express';
import { MutualFriend } from '../Controllers/Small_Information.js';



const InfoRouter = express.Router();



InfoRouter.get(
"/mutual-friends/:currentuser/:frienduser",

  MutualFriend
);



export default InfoRouter;