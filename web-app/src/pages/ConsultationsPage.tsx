import { useEffect, useState } from "react";
import { apiFetch } from "../api/http";

export default function ConsultationsPage() {
  const [consultations, setConsultations] = useState([]);

  useEffect(() => {
    apiFetch("/consultations/dossier/ID_DOSSIER")
      .then(res => res.json())
      .then(setConsultations);
  }, []);

  return (
    <ul>
      {consultations.map((c: any) => (
        <li key={c.id_consultation}>{c.motif}</li>
      ))}
    </ul>
  );
}
