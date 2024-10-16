import * as AlertDialog from "@radix-ui/react-alert-dialog";
import axios from "axios";
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";

const Register = () => {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [dialogOpen, setDialogOpen] = useState(false); // To control the dialog open state
  const [dialogMessage, setDialogMessage] = useState(""); // To control the dialog message
  const navigate = useNavigate();

  const handleRegister = async (e) => {
    e.preventDefault();
    try {
      await axios.post("http://localhost:5000/api/auth/register", {
        username,
        password,
      });
      setDialogMessage("Admin registered successfully");
      setDialogOpen(true); // Show success dialog
    } catch (error) {
      setDialogMessage("Registration failed: " + error.response.data.message);
      setDialogOpen(true); // Show error dialog
    }
  };

  return (
    <div>
      <form onSubmit={handleRegister}>
        <input
          type="text"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          placeholder="Username"
          required
        />
        <input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="Password"
          required
        />
        <button type="submit">Register</button>
      </form>

      {/* Alert Dialog Structure */}
      <AlertDialog.Root open={dialogOpen} onOpenChange={setDialogOpen}>
        <AlertDialog.Trigger asChild>
          {/* Hidden Trigger (it will be controlled programmatically) */}
        </AlertDialog.Trigger>
        <AlertDialog.Overlay className="dialog-overlay" />
        <AlertDialog.Content className="dialog-content">
          <AlertDialog.Title>
            {dialogMessage.includes("failed") ? "Error" : "Success"}
          </AlertDialog.Title>
          <AlertDialog.Description>{dialogMessage}</AlertDialog.Description>
          <AlertDialog.Action asChild>
            <button
              onClick={() => {
                setDialogOpen(false);
                if (!dialogMessage.includes("failed")) {
                  navigate("/"); // Navigate only on success
                }
              }}
            >
              OK
            </button>
          </AlertDialog.Action>
        </AlertDialog.Content>
      </AlertDialog.Root>
    </div>
  );
};

export default Register;
