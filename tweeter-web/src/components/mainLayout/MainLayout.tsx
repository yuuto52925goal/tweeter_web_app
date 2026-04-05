import "./MainLayout.css";
import { useState } from "react";
import { Outlet } from "react-router-dom";
import AppNavbar from "../appNavbar/AppNavbar";
import PostStatus from "../postStatus/PostStatus";
import UserInfo from "../userInfo/UserInfoComponent";

const MainLayout = () => {
  const [statusPostedAt, setStatusPostedAt] = useState(0);

  return (
    <>
      <AppNavbar />
      <div className="container mx-auto px-3 w-100">
        <div className="row gx-4">
          <div className="col-4">
            <div className="row gy-4">
              <div className="p-3 mb-4 border rounded bg-light">
                <UserInfo />
              </div>
              <div className="p-3 border mt-1 rounded bg-light">
                <PostStatus onStatusPosted={() => setStatusPostedAt(Date.now())} />
              </div>
            </div>
          </div>
          <div className="col-8 px-0">
            <div className="bg-white ms-4 w-100">
              <Outlet context={statusPostedAt} />
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default MainLayout;
