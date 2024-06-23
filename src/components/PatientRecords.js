import React, { useEffect, useState } from "react";
import ClipLoader from "react-spinners/ClipLoader";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import Modal from "./Modal";
import "./PatientRecords.css";

const PatientRecords = () => {
  const [patients, setPatients] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newPatient, setNewPatient] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    address: "",
    dateOfBirth: "",
  });
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [lazyLoadCount, setLazyLoadCount] = useState(9);

  useEffect(() => {
    const fetchPatients = async () => {
      setLoading(true);
      try {
        const response = await fetch(`${process.env.REACT_APP_API_URL}/patients`, {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        });

        if (!response.ok) {
          throw new Error(`Error fetching patients: ${response.statusText}`);
        }

        const data = await response.json();
        data.sort((a, b) => b.patientId - a.patientId);
        setPatients(data);
        toast.success("Patient record fetched successfully!");
      } catch (error) {
        console.error("Error fetching patients:", error);
        toast.error(`Error fetching patients: ${error.message}`);
      } finally {
        setLoading(false);
      }
    };

    fetchPatients();
  }, []);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    if (name === "phone") {
      const sanitizedValue = value.replace(/\D/g, ""); // Remove non-digit characters
      if (sanitizedValue.length <= 10) {
        setNewPatient((prevPatient) => ({
          ...prevPatient,
          [name]: sanitizedValue,
        }));
      }
    } else {
      setNewPatient((prevPatient) => ({
        ...prevPatient,
        [name]: value,
      }));
    }
  };

  const handleAddPatient = async (e) => {
    e.preventDefault();
    setLoading(true);
    console.log("Adding patient:", newPatient);
    try {
      const response = await fetch(`${process.env.REACT_APP_API_URL}/patients/register`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
        body: JSON.stringify(newPatient),
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Error adding patient: ${errorText}`);
      }

      const data = await response.json();
      console.log("Added patient:", data);

      setPatients((prevPatients) => {
        const updatedPatients = [data, ...prevPatients];
        updatedPatients.sort((a, b) => b.patientId - a.patientId);
        return updatedPatients;
      });

      setNewPatient({
        firstName: "",
        lastName: "",
        email: "",
        phone: "",
        address: "",
        dateOfBirth: "",
      });
      setIsModalOpen(false);
      toast.success("Patient added successfully!");
    } catch (error) {
      console.error("Error adding patient:", error);
      toast.error(`${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  const loadMorePatients = () => {
    setLazyLoadCount((prevCount) => prevCount + 9);
  };

  const filteredPatients = patients
    .filter((patient) =>
      `${patient.firstName} ${patient.lastName}`
        .toLowerCase()
        .includes(searchTerm.toLowerCase())
    )
    .slice(0, lazyLoadCount);

  useEffect(() => {
    console.log("Filtered Patients:", filteredPatients);
  }, [filteredPatients]);

  return (
    <div className="patient-records">
      <h2>Patient Records</h2>
      <input
        type="text"
        placeholder="Search patients..."
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
        className="search-bar"
      />
      <button className="btn" onClick={() => setIsModalOpen(true)}>
        Add Patient
      </button>

      {loading ? (
        <div className="spinner">
          <ClipLoader size={50} color={"#123abc"} loading={loading} />
        </div>
      ) : (
        <>
          <table className="patient-table">
            <thead>
              <tr>
                <th>ID</th>
                <th>First Name</th>
                <th>Last Name</th>
                <th>Email</th>
                <th>Phone</th>
                <th>Address</th>
                <th>Date of Birth</th>
              </tr>
            </thead>
            <tbody>
              {filteredPatients.map((patient) => (
                <tr key={patient.patientId}>
                  <td>{patient.patientId}</td>
                  <td>{patient.firstName}</td>
                  <td>{patient.lastName}</td>
                  <td>{patient.email}</td>
                  <td>{patient.phone}</td>
                  <td>{patient.address}</td>
                  <td>{new Date(patient.dateOfBirth).toLocaleDateString()}</td>
                </tr>
              ))}
            </tbody>
          </table>

          {filteredPatients.length < patients.length && (
            <button className="load-more-button" onClick={loadMorePatients}>
              Load More
            </button>
          )}
        </>
      )}

      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        className="patient-modal"
      >
        <h2 className="modal__header">Add New Patient</h2>
        <form className="modal__form" onSubmit={handleAddPatient}>
          <label>First Name</label>
          <input
            type="text"
            name="firstName"
            value={newPatient.firstName}
            onChange={handleInputChange}
            required
          />
          <label>Last Name</label>
          <input
            type="text"
            name="lastName"
            value={newPatient.lastName}
            onChange={handleInputChange}
            required
          />
          <label>Email</label>
          <input
            type="email"
            name="email"
            value={newPatient.email}
            onChange={handleInputChange}
            required
          />
          <label>Phone</label>
          <input
            type="text"
            name="phone"
            value={newPatient.phone}
            onChange={handleInputChange}
            required
          />
          <label>Address</label>
          <input
            type="text"
            name="address"
            value={newPatient.address}
            onChange={handleInputChange}
            required
          />
          <label>Date of Birth</label>
          <input
            type="date"
            name="dateOfBirth"
            value={newPatient.dateOfBirth}
            onChange={handleInputChange}
            required
          />
          <button className="btn" type="submit" disabled={loading}>
            {loading ? <ClipLoader size={20} color={"#fff"} /> : "Add Patient"}
          </button>
        </form>
      </Modal>

      <ToastContainer />
    </div>
  );
};

export default PatientRecords;
