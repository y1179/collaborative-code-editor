function Login({ handleJoin }) {
  return (
    <main
      style={{
        height: "100vh",
        width: "100vw",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        backgroundColor: "#0D1117",
      }}
    >
      <div
        style={{
          backgroundColor: "#161B22",
          padding: "2rem",
          borderRadius: "1rem",
          border: "1px solid #30363D",
          width: "100%",
          maxWidth: "380px",
        }}
      >
        <h2
          style={{
            color: "white",
            fontSize: "1.25rem",
            fontWeight: "600",
            marginBottom: "1rem",
          }}
        >
          Enter Username
        </h2>

        <form onSubmit={handleJoin}>
          <input
            type="text"
            name="username"
            placeholder="Username"
            style={{
              width: "100%",
              backgroundColor: "#0D1117",
              color: "white",
              border: "1px solid #30363D",
              borderRadius: "0.5rem",
              padding: "0.5rem 1rem",
              outline: "none",
              boxSizing: "border-box",
            }}
          />

          <button
            type="submit"
            style={{
              marginTop: "1rem",
              width: "100%",
              backgroundColor: "#2563eb",
              color: "white",
              padding: "0.5rem",
              borderRadius: "0.5rem",
              border: "none",
              cursor: "pointer",
            }}
          >
            Join Session
          </button>
        </form>
      </div>
    </main>
  );
}

export default Login;