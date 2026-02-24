import React, { useEffect, useRef, useState } from "react";
import "./register.scss";
import {
  backgroundImg1,
  backgroundImg2,
  backgroundImg3,
  backgroundImg4,
  logo,
  FaEye,
  FaEyeSlash,
} from "../../constants/index.js";
import Carousel from "../../components/carousel/Carousel.jsx";
import { Link } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { signUp } from "../../features/auth/authAction.js";
import { fetchDepartments } from "../../features/academics/academicsAction.js";

export default function Register() {
  const [hidePass, setHidePass] = useState(true);
  const auth = useSelector((select) => select.auth);
  const { departments } = useSelector((s) => s.academics);

  const dispatch = useDispatch();
  const usernameRef = useRef();
  const emailRef = useRef();
  const passRef = useRef();
  const registerNumberRef = useRef();

  const [selectedDept, setSelectedDept] = useState("");
  const [selectedBatch, setSelectedBatch] = useState("");

  useEffect(() => {
    dispatch(fetchDepartments());
  }, [dispatch]);

  // Batches available for the chosen department
  const deptObj = departments?.find((d) => d.name === selectedDept) || null;
  const availableBatches = deptObj?.batches || [];

  // Reset batch when department changes
  const handleDeptChange = (e) => {
    setSelectedDept(e.target.value);
    setSelectedBatch("");
  };

  const handleRegister = (e) => {
    e.preventDefault();

    dispatch(
      signUp(
        usernameRef.current.value,
        emailRef.current.value,
        passRef.current.value,
        {
          registerNumber: registerNumberRef.current?.value || undefined,
          department: selectedDept || undefined,
          division: selectedBatch || undefined,
        }
      )
    );
  };

  return (
    <div className="register">
      <div className="register-wrapper">
        <div className="reg-wrap-left">
          <div className="logo">
            <img src={logo} alt="" />
          </div>
          <h1>Register</h1>
          <form onSubmit={handleRegister} className="register-form">
            <p className="error-message">{auth.error && auth.error}</p>

            <label htmlFor="username">Username</label>
            <input type="text" placeholder="Enter username" ref={usernameRef} />

            <label htmlFor="email">Email</label>
            <input type="email" placeholder="Enter Email" ref={emailRef} />

            <label htmlFor="password">Password</label>
            <div className="pass-div">
              <input
                type={`${hidePass ? "password" : "text"}`}
                placeholder="Enter your password"
                ref={passRef}
              />
              {hidePass ? (
                <FaEyeSlash
                  className="icon"
                  onClick={() => setHidePass(!hidePass)}
                />
              ) : (
                <FaEye
                  className="icon"
                  onClick={() => setHidePass(!hidePass)}
                />
              )}
            </div>

            <label htmlFor="registerNumber">Register Number</label>
            <input
              type="text"
              id="registerNumber"
              placeholder="e.g. 22CS001"
              ref={registerNumberRef}
            />

            <label htmlFor="department">Department</label>
            <select
              id="department"
              value={selectedDept}
              onChange={handleDeptChange}
              className="select-field"
            >
              <option value="">-- Select Department --</option>
              {(departments || []).map((d) => (
                <option key={d._id} value={d.name}>
                  {d.name}
                </option>
              ))}
            </select>

            <label htmlFor="batch">Batch / Division</label>
            <select
              id="batch"
              value={selectedBatch}
              onChange={(e) => setSelectedBatch(e.target.value)}
              className="select-field"
              disabled={!selectedDept || availableBatches.length === 0}
            >
              <option value="">
                {!selectedDept
                  ? "-- Select Department first --"
                  : availableBatches.length === 0
                  ? "-- No batches available --"
                  : "-- Select Batch --"}
              </option>
              {availableBatches.map((b) => (
                <option key={b} value={b}>
                  {b}
                </option>
              ))}
            </select>

            <button type="submit" className="button">
              Sign Up
            </button>

            <div className="left-bottom">
              <p>or</p>
              <p>
                Already have an account?{" "}
                <Link to={"/login"}>
                  <span>Sign In</span>
                </Link>
              </p>
            </div>
          </form>
        </div>
        <div className="reg-wrap-right">
          <Carousel
            images={[
              backgroundImg1,
              backgroundImg2,
              backgroundImg3,
              backgroundImg4,
            ]}
          />
        </div>
      </div>
    </div>
  );
}
