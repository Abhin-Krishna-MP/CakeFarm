import React, { useState } from "react";
import ReactDOM from "react-dom";
import "./userList.scss";
import { profilePic } from "../../assets";
import { useSelector, useDispatch } from "react-redux";
import {
  AiOutlineEdit,
  MdDeleteOutline,
  IoCheckmarkSharp,
  RxCross2,
  usersList,
} from "../../constants";
import { searchValueInArrObj } from "../../utils/helper";
import { useEffect } from "react";
import { deleteUser, getAllUsers } from "../../features/users/usersAction";

/* ─── Confirmation modal ─── */
function ConfirmDeleteModal({ user, onConfirm, onCancel }) {
  return ReactDOM.createPortal(
    <div className="ul-confirm-overlay" onClick={onCancel}>
      <div className="ul-confirm-modal" onClick={(e) => e.stopPropagation()}>
        <div className="ul-confirm-icon">
          <MdDeleteOutline />
        </div>
        <h3 className="ul-confirm-title">Delete User</h3>
        <p className="ul-confirm-msg">
          Are you sure you want to delete{" "}
          <strong>{user.username}</strong>? This action cannot be undone.
        </p>
        <div className="ul-confirm-btns">
          <button className="ul-confirm-cancel" onClick={onCancel}>
            <RxCross2 /> Cancel
          </button>
          <button className="ul-confirm-delete" onClick={onConfirm}>
            <MdDeleteOutline /> Delete
          </button>
        </div>
      </div>
    </div>,
    document.body
  );
}

const UserListChild = ({ user }) => {
  const [toggleEditMode, setToggleEditMode] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  const { token } = useSelector((state) => state.auth);
  const dispatch = useDispatch();

  const handleUpdateUser = () => {
    setToggleEditMode(false);
  };

  const handleConfirmDelete = () => {
    dispatch(deleteUser(token, user.userId));
    setShowConfirm(false);
  };

  return (
    <>
      <div className="user-list-child">
        <div className="user-name-avatar">
          <img
            src={
              user.avatar
                ? `${import.meta.env.VITE_API_BASE_IMAGE_URI}/assets/images/users/${user.avatar}`
                : profilePic
            }
            alt={user.username}
            onError={(e) => { e.currentTarget.src = profilePic; }}
          />
          <input type="text" value={user.username} disabled={!toggleEditMode} />
        </div>

        <div className="user-email">
          <input type="email" value={user.email} disabled={!toggleEditMode} />
        </div>

        <div className="user-role">
          <p>{user.role}</p>
        </div>

        <div className="user-update">
          {user.role !== "admin" && (
            <MdDeleteOutline
              onClick={() => setShowConfirm(true)}
              className="icon"
            />
          )}
        </div>
      </div>

      {showConfirm && (
        <ConfirmDeleteModal
          user={user}
          onConfirm={handleConfirmDelete}
          onCancel={() => setShowConfirm(false)}
        />
      )}
    </>
  );
};

export default function UserList() {
  const { users } = useSelector((state) => state.users);
  const [userList, setUserList] = useState(users || null);
  const { token } = useSelector((state) => state.auth);
  const dispatch = useDispatch();

  const handleInputKeyDown = (event) => {
    if (event.key === "Enter") {
      const filteredUserList = searchValueInArrObj(users, event.target.value);

      setUserList(filteredUserList);
    }

    if (event.target.value.trim() === "") {
      setUserList(users);
    }
  };

  const checkIfInputEmpty = (event) => {
    if (event.target.value.trim() === "") {
      setUserList(users);
    }
  };

  useEffect(() => {
    dispatch(getAllUsers(token));
  }, [token]);

  return (
    <div className="user-list">
      <div className="head">
        <p>Users</p>
        <input
          type="text"
          placeholder="search user by fields..."
          onKeyDown={handleInputKeyDown}
          onChange={checkIfInputEmpty}
        />
      </div>
      <div className="user-list-wrapper">
        {/* <ul className="list-header">
          <li>User Id</li>
          <li>User Name</li>
          <li>User Email</li>
          <li>User Role</li>
          <li>Update User</li>
        </ul> */}
        {users &&
          users?.map((user, index) => (
            <UserListChild key={index} user={user} />
          ))}
      </div>
    </div>
  );
}
