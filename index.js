import express, { query } from "express";
const router = express.Router();
import { db } from "../db.js";

router.get("/courses", async (req, res) => {
  try {
    const query = `SELECT * FROM course ORDER BY course_id`;
    const { rows } = await db.query(query);
    res.status(200).json(rows);
  } catch (err) {
    res.status(500).send(err.message);
  }
});

router.get("/depts/:name", async (req, res) => {
  try {
    const { name } = req.params;
    const query = `SELECT * FROM department WHERE dept_name = $1`;
    const { rows } = await db.query(query, [name]);
    res.status(200).json(rows);
  } catch (err) {
    res.status(500).send(err.message);
  }
});

router.get("/courses/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const course = await db.query(
      `SELECT * FROM course WHERE course_id = $1;`,
      [id]
    );
    const depts = await db.query(`SELECT * FROM department;`);
    res.status(200).json({ course: course.rows, depts: depts.rows });
  } catch (err) {
    res.status(500).send(err.message);
  }
});

router.post("/courses/save", async (req, res) => {
  console.log(req.body);
  try {
    const { course_id, title, dept_name, credits } = req.body;
    const query = `UPDATE course SET title = $1, dept_name = $2, credits  = $3 WHERE course_id = $4 RETURNING *;`;
    const result = await db.query(query, [
      title,
      dept_name,
      credits,
      course_id,
    ]);
    const { rows } = await db.query(`SELECT * FROM course ORDER BY course_id`);
    res.status(200).json(rows);
  } catch (err) {
    res.status(500).send(err.message);
  }
});

// Add these new routes after your existing routes

// Add this new route after your existing routes
router.get("/kpi", async (req, res) => {
  try {
    // Students per Department
    const studentsPerDept = await db.query(`
      SELECT dept_name, COUNT(*) AS student_count
      FROM student
      GROUP BY dept_name
      ORDER BY student_count DESC
    `);

    // Average Salary per Department
    const avgSalaryPerDept = await db.query(`
      SELECT dept_name, ROUND(AVG(salary), 2) AS avg_salary
      FROM instructor
      GROUP BY dept_name
      ORDER BY avg_salary DESC
    `);

    // Courses per Department
    const coursesPerDept = await db.query(`
      SELECT dept_name, COUNT(*) AS course_count
      FROM course
      GROUP BY dept_name
      ORDER BY course_count DESC
    `);

    // Classroom Utilization
    const classroomUtilization = await db.query(`
      SELECT 
        c.building, 
        c.room_number, 
        c.capacity,
        COUNT(s.course_id) AS sections_held,
        ROUND(COUNT(s.course_id) * 100.0 / GREATEST(c.capacity, 1), 2) AS utilization_percent
      FROM classroom c
      LEFT JOIN section s ON c.building = s.building AND c.room_number = s.room_number
      GROUP BY c.building, c.room_number, c.capacity
      ORDER BY utilization_percent DESC
    `);

    res.status(200).json({
      studentsPerDept: studentsPerDept.rows,
      avgSalaryPerDept: avgSalaryPerDept.rows,
      coursesPerDept: coursesPerDept.rows,
      classroomUtilization: classroomUtilization.rows
    });
  } catch (err) {
    res.status(500).send(err.message);
  }
});
export default router;
