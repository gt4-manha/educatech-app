import React, { useEffect, useState } from "react";
import { createRoot } from "react-dom/client";
import "./styles.css";

const API = "https://educatech-api.onrender.com/api";
const tabs = [
  ["alunos", "Alunos"],
  ["professores", "Professores"],
  ["cursos", "Cursos"],
  ["matriculas", "Matrículas"],
];

async function request(path, options = {}) {
  const response = await fetch(`${API}${path}`, {
    headers: { "Content-Type": "application/json" },
    ...options,
  });
  if (!response.ok) {
    const body = await response.json().catch(() => ({}));
    throw new Error(body.error || "Não foi possível concluir a operação.");
  }
  return response.status === 204 ? null : response.json();
}

function App() {
  const [active, setActive] = useState("alunos");
  const [records, setRecords] = useState([]);
  const [professors, setProfessors] = useState([]);
  const [students, setStudents] = useState([]);
  const [courses, setCourses] = useState([]);
  const [editingId, setEditingId] = useState(null);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [form, setForm] = useState({});

  const load = () =>
    request(`/${active}`)
      .then(setRecords)
      .catch((e) => setError(e.message));
  useEffect(() => {
    setForm({});
    setEditingId(null);
    setError("");
    load();
    Promise.all([
      request("/professores"),
      request("/alunos"),
      request("/cursos"),
    ])
      .then(([professorsData, studentsData, coursesData]) => {
        setProfessors(professorsData);
        setStudents(studentsData);
        setCourses(coursesData);
      })
      .catch((e) => setError(e.message));
  }, [active]);

  const submit = async (event) => {
    event.preventDefault();
    setError("");
    setMessage("");
    try {
      const path = editingId ? `/${active}/${editingId}` : `/${active}`;
      const body =
        editingId && active === "matriculas"
          ? { notaFinal: form.notaFinal, situacao: form.situacao }
          : form;
      await request(path, {
        method: editingId ? "PUT" : "POST",
        body: JSON.stringify(body),
      });
      setForm({});
      setEditingId(null);
      setMessage(
        editingId
          ? "Matrícula atualizada com sucesso."
          : "Registro criado com sucesso.",
      );
      load();
    } catch (e) {
      setError(e.message);
    }
  };

  const editEnrollment = (record) => {
    setEditingId(record.id);
    setForm({
      alunoId: record.alunoId,
      cursoId: record.cursoId,
      notaFinal: record.notaFinal,
      situacao: record.situacao,
    });
    setMessage("");
    setError("");
  };

  const cancelEdit = () => {
    setEditingId(null);
    setForm({});
  };

  const remove = async (id) => {
    try {
      await request(`/${active}/${id}`, { method: "DELETE" });
      setMessage("Registro removido.");
      load();
    } catch (e) {
      setError(e.message);
    }
  };

  return (
    <main className="container">
      <header>
        <div>
          <span className="eyebrow">REVISÃO FULLSTACK</span>
          <h1>Educatech</h1>
          <p>Modelagem, API REST e React em uma tela.</p>
        </div>
        <span className="status">
          <i /> API integrada
        </span>
      </header>
      <nav>
        {tabs.map(([key, label]) => (
          <button
            className={active === key ? "selected" : ""}
            onClick={() => setActive(key)}
            key={key}
          >
            {label}
          </button>
        ))}
      </nav>
      <section className="panel">
        <div className="panel-heading">
          <div>
            <h2>{tabs.find(([key]) => key === active)[1]}</h2>
            <p>Operações realizadas pela educatech-api</p>
          </div>
          <strong>{records.length} registros</strong>
        </div>
        {message && <div className="notice success">{message}</div>}
        {error && <div className="notice error">{error}</div>}
        <form onSubmit={submit} className="form-grid">
          {active === "alunos" && (
            <>
              <Field
                label="Nome"
                value={form.nome || ""}
                onChange={(v) => setForm({ ...form, nome: v })}
                required
              />
              <Field
                label="E-mail"
                type="email"
                value={form.email || ""}
                onChange={(v) => setForm({ ...form, email: v })}
                required
              />
              <Field
                label="Nascimento"
                type="date"
                value={form.dataNascimento || ""}
                onChange={(v) => setForm({ ...form, dataNascimento: v })}
              />
            </>
          )}
          {active === "professores" && (
            <>
              <Field
                label="Nome"
                value={form.nome || ""}
                onChange={(v) => setForm({ ...form, nome: v })}
                required
              />
              <Field
                label="E-mail"
                type="email"
                value={form.email || ""}
                onChange={(v) => setForm({ ...form, email: v })}
                required
              />
              <Field
                label="Especialidade"
                value={form.especialidade || ""}
                onChange={(v) => setForm({ ...form, especialidade: v })}
              />
            </>
          )}
          {active === "cursos" && (
            <>
              <Field
                label="Nome"
                value={form.nome || ""}
                onChange={(v) => setForm({ ...form, nome: v })}
                required
              />
              <Field
                label="Carga horária"
                type="number"
                min="1"
                value={form.cargaHoraria || ""}
                onChange={(v) => setForm({ ...form, cargaHoraria: Number(v) })}
                required
              />
              <Field
                label="Valor"
                type="number"
                min="0"
                step="0.01"
                value={form.valor || ""}
                onChange={(v) => setForm({ ...form, valor: Number(v) })}
                required
              />
              <SelectField
                label="Professor"
                value={form.professorId || ""}
                onChange={(v) => setForm({ ...form, professorId: Number(v) })}
                options={professors}
                placeholder="Selecione o professor"
              />
            </>
          )}
          {active === "matriculas" && (
            <>
              <SelectField
                label="Aluno"
                value={form.alunoId || ""}
                onChange={(v) => setForm({ ...form, alunoId: Number(v) })}
                options={students}
                placeholder="Selecione o aluno"
                disabled={Boolean(editingId)}
              />
              <SelectField
                label="Curso"
                value={form.cursoId || ""}
                onChange={(v) => setForm({ ...form, cursoId: Number(v) })}
                options={courses}
                placeholder="Selecione o curso"
                disabled={Boolean(editingId)}
              />
              <Field
                label="Nota (0 a 10)"
                type="number"
                min="0"
                max="10"
                step="0.01"
                value={form.notaFinal ?? ""}
                onChange={(v) =>
                  setForm({ ...form, notaFinal: v === "" ? null : Number(v) })
                }
              />
              <label>
                Situação
                <select
                  value={form.situacao || "EM_ANDAMENTO"}
                  onChange={(e) =>
                    setForm({ ...form, situacao: e.target.value })
                  }
                >
                  <option>EM_ANDAMENTO</option>
                  <option>CONCLUIDA</option>
                  <option>CANCELADA</option>
                </select>
              </label>
            </>
          )}
          <button className="primary" type="submit">
            {editingId ? "Salvar alteração" : "Adicionar"}
          </button>
          {editingId && (
            <button className="secondary" type="button" onClick={cancelEdit}>
              Cancelar
            </button>
          )}
        </form>
        <Table
          active={active}
          records={records}
          onRemove={remove}
          onEdit={editEnrollment}
        />
      </section>
    </main>
  );
}

function Field({ label, type = "text", value, onChange, ...props }) {
  return (
    <label>
      {label}
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        {...props}
      />
    </label>
  );
}

function SelectField({
  label,
  value,
  onChange,
  options,
  placeholder,
  disabled,
}) {
  return (
    <label>
      {label}
      <select
        required
        disabled={disabled}
        value={value}
        onChange={(e) => onChange(e.target.value)}
      >
        <option value="">{placeholder}</option>
        {options.map((option) => (
          <option value={option.id} key={option.id}>
            {option.id} - {option.nome}
          </option>
        ))}
      </select>
    </label>
  );
}

function Table({ active, records, onRemove, onEdit }) {
  const columns =
    active === "alunos"
      ? ["id", "nome", "email", "dataNascimento"]
      : active === "professores"
        ? ["id", "nome", "email", "especialidade"]
        : active === "cursos"
          ? ["id", "nome", "cargaHoraria", "valor", "professor"]
          : ["id", "aluno", "curso", "notaFinal", "situacao"];
  return (
    <div className="table-wrap">
      <table>
        <thead>
          <tr>
            {columns.map((column) => (
              <th key={column}>
                {column.replace(/[A-Z]/g, (l) => ` ${l}`).toUpperCase()}
              </th>
            ))}
            <th />
          </tr>
        </thead>
        <tbody>
          {records.map((record) => (
            <tr key={record.id}>
              {columns.map((column) => (
                <td key={column}>
                  {typeof record[column] === "object"
                    ? record[column]?.nome
                    : (record[column] ?? "—")}
                </td>
              ))}
              <td>
                {active === "matriculas" && (
                  <button className="edit" onClick={() => onEdit(record)}>
                    Editar
                  </button>
                )}
                <button className="delete" onClick={() => onRemove(record.id)}>
                  Excluir
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      {!records.length && <div className="empty">Nenhum registro ainda.</div>}
    </div>
  );
}

createRoot(document.getElementById("root")).render(<App />);
