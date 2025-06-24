const API = "http://localhost:4500";

function App() {
  return {
    page: 1,
    courses: [],
    dept: {},
    course: {},
    depts: [],
    kpis: null,
    
    async getCourses() {
      const courses = await fetch(`${API}/api/courses`).then((res) =>
        res.json()
      );
      console.log(courses);
      this.courses = courses;
    },
    async getDept(dept_name) {
      console.log(dept_name);
      const dept = await fetch(`${API}/api/depts/${dept_name}`).then((res) =>
        res.json()
      );
      console.log(dept[0]);
      this.dept = dept[0];
    },
    async Edit(course_id) {
      console.log(course_id);
      const { course, depts } = await fetch(
        `${API}/api/courses/${course_id}`
      ).then((res) => res.json());
      this.page = 2;
      console.log(course[0], depts);
      this.course = course[0];
      this.depts = depts;
    },
    async Save() {
      fetch(`${API}/api/courses/save`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(this.course),
      })
        .then((res) => res.json())
        .then((data) => {
          console.log(data);
          this.courses = data;
          this.page = 1;
        });
    },
    async loadKPIs() {
      this.kpis = await fetch(`${API}/api/kpi`).then(res => res.json());
      this.page = 3;
    }
  };
}
