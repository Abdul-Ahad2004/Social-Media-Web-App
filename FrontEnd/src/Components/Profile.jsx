import Place from "@mui/icons-material/Place";
import Language from "@mui/icons-material/Language";
import EmailOutlined from "@mui/icons-material/EmailOutlined";
import MoreVert from "@mui/icons-material/MoreVert";
import Posts from "./Posts"
import toast from "react-hot-toast";
import axios from "axios"
import { Link, useNavigate } from "react-router-dom";

import { useContext, useEffect, useState } from "react";

import { MakeRequest } from '../../axios';
import { AuthContext } from "../Context/AuthContext";

import {
  useQuery, useMutation, useQueryClient
} from '@tanstack/react-query'

import '../Css/Profile.scss'
import { useLocation } from 'react-router-dom';

const Profile = () => {

  const navigate = useNavigate();

  const [file, setFile] = useState(null);
  useEffect(() => {
    if (file) {
      myfunc();
      setFile(null);
    }
  }, [file]);

  const user_id = parseInt(useLocation().pathname.split("/")[2]);
  const { currentUser } = useContext(AuthContext);

  const { isPending, error, data } = useQuery({
    queryKey: ['user'],

    queryFn: async () => {
      try {
        const res = await MakeRequest.get("/users/find/" + user_id);
        return res.data;
      }
      catch (err) {
        toast.error(err.message)
      }
    }
  })

  const { isPending: pending, data: frienddata } = useQuery({
    queryKey: ['friends'],

    queryFn: async () => {
      const res = await MakeRequest.get("/Friends/friends/" + user_id);
      return res.data.map(friend => friend.user_id);
    }
  })

  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: async (isFriend) => {
      if (!isFriend) {
        try {
          return MakeRequest.post(`/FriendsR/accept-friend-request/${user_id}/${currentUser.user_id}`);
        }
        catch (err) {
          toast.error("This User is already your friend");
        }
      }
      const res = await MakeRequest.delete(`/FriendsR/${user_id}/${currentUser.user_id}`);
      console.log(res.data.message)
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['friends'] })
    },
  })

  const handleAddFriend = () => {
    mutation.mutate(frienddata.includes(currentUser.user_id))
  }

  const mutation2 = useMutation({
    mutationFn: (newUserPic) => {
      return MakeRequest.post(`/users/${currentUser.user_id}`, newUserPic);
    },
    onSuccess: () => {
      // Invalidate and refetch
      queryClient.invalidateQueries({ queryKey: ['user'] })
    },
  })

  const myfunc = async () => {
    const formData = new FormData();
    formData.append("file", file);
    const imgUrl = await MakeRequest.post("/uploadpic/"+currentUser.user_id, formData);
    mutation2.mutate({ imgUrl: imgUrl })

  }

  return (
    <div className="profile">
      <div className="images">
        {/* Cover picture always same  */}
        <img
          src={data == null ? "" : "../../public/Uploads/" + data.cover_picture}
          alt=""
          className="cover"
        />

        {/* Profile Pic Input  */}
        <input
          type="file"
          id="file"
          style={{ display: "none" }}
          onChange={(e) => { if (user_id === currentUser.user_id) { setFile(e.target.files[0]) } }}
        />

        {/* Label for profile Pic */}
        <label htmlFor={`file${user_id != currentUser.user_id ? `no` : ``}`} >
          <img
            src={data == null ? "" : "../../public/Uploads/" + data.profile_picture}
            alt=""
            className="profilePic"
          />
        </label>

      </div>

      <div className="profileContainer">

        <div className="uInfo">

          <div className="center">
            <span>{data == null ? "Loading..." : data.username}</span>

            {user_id === currentUser.user_id ? (<button>Update</button>) : <button onClick={handleAddFriend}>{pending ? false : frienddata.includes(currentUser.user_id) ? "Friends" : "Add Friend"}</button>}

          </div>

          <div className="right">
            <Link>
              <EmailOutlined onClick={() => (navigate("/messages"))} />
            </Link>
            <MoreVert />
          </div>

        </div>
        {pending ? false : frienddata.includes(currentUser.user_id) || currentUser.user_id === user_id ?
          <Posts user_id={user_id} /> : <div style={{ display: "flex", justifyContent: "center", padding: "20px", color: "black", fontWeight: "bolder" }}> <h2 >Add this Person to see Posts</h2></div>}
      </div>
    </div >
  )
}

export default Profile
