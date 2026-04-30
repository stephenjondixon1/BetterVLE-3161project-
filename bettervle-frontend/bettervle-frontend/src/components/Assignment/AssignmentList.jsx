import { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { assignmentAPI, courseAPI } from '../../services/api';
import SubmitAssignment from './SubmitAssignment';
import GradeAssignment from './GradeAssignment';
import CreateAssignmentModal from './CreateAssignmentModal';
import toast from 'react-hot-toast';

const AssignmentList = ({ courseCode }) => {
  const { user } = useAuth();
  const [assignments, setAssignments] = useState([]);
  const [submissions, setSubmissions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showSubmitModal, setShowSubmitModal] = useState(false);
  const [showGradeModal, setShowGradeModal] = useState(false);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [selectedAssignment, setSelectedAssignment] = useState(null);
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [students, setStudents] = useState([]);
  const [assignmentSubmissions, setAssignmentSubmissions] = useState({});

  useEffect(() => {
    fetchData();
  }, [courseCode]);

  const fetchData = async () => {
    setLoading(true);
    try {
      const assignmentsRes = await assignmentAPI.getCourseAssignments(courseCode);
      console.log('Assignments:', assignmentsRes.data);
      setAssignments(assignmentsRes.data);

      if (user.role === 'lecturer') {
        const membersRes = await courseAPI.getMembers(courseCode);
        setStudents(membersRes.data.students || []);

        const subsMap = {};
        for (const assignment of assignmentsRes.data) {
          try {
            const subsRes = await assignmentAPI.getAssignmentSubmissions(assignment.assign_id);
            subsMap[assignment.assign_id] = subsRes.data;
          } catch (error) {
            subsMap[assignment.assign_id] = [];
          }
        }
        setAssignmentSubmissions(subsMap);
      }

      if (user.role === 'student') {
        const submissionsRes = await assignmentAPI.getSubmissions(user.user_id);
        console.log('Student submissions:', submissionsRes.data);
        setSubmissions(submissionsRes.data);
      }
    } catch (error) {
      console.error('Error fetching data:', error);
      toast.error('Failed to load assignments');
    } finally {
      setLoading(false);
    }
  };

  const getSubmissionForAssignment = (assignmentId) => {
    return submissions.find(s => s.assign_id === assignmentId);
  };

  const handleAssignmentCreated = () => {
    fetchData();
  };

  const handleAssignmentSubmitted = () => {
    fetchData();
    setShowSubmitModal(false);
    setSelectedAssignment(null);
  };

  const handleGradeSuccess = () => {
    fetchData();
    setShowGradeModal(false);
    setSelectedStudent(null);
    setSelectedAssignment(null);
  };

  const openSubmitModal = (assignment) => {
    console.log('Opening submit modal for assignment:', assignment);
    setSelectedAssignment(assignment);
    setShowSubmitModal(true);
  };

  if (loading) {
    return <div className="text-center py-10">Loading assignments...</div>;
  }

  return (
    <div>
      {user.role === 'lecturer' && (
        <div className="mb-4 flex justify-end">
          <button
            onClick={() => setShowCreateModal(true)}
            className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700"
          >
            + Create New Assignment
          </button>
        </div>
      )}

      {assignments.length === 0 ? (
        <div className="bg-white rounded-lg shadow-md p-8 text-center">
          <p className="text-gray-500">No assignments created for this course yet.</p>
          {user.role === 'lecturer' && (
            <button
              onClick={() => setShowCreateModal(true)}
              className="mt-4 bg-indigo-600 text-white px-4 py-2 rounded hover:bg-indigo-700"
            >
              Create First Assignment
            </button>
          )}
        </div>
      ) : (
        <div className="space-y-6">
          {assignments.map((assignment) => {
            const studentSubmission = getSubmissionForAssignment(assignment.assign_id);

            return (
              <div key={assignment.assign_id} className="bg-white rounded-lg shadow-md overflow-hidden border border-gray-200">
                <div className="bg-indigo-600 px-6 py-4">
                  <div className="flex justify-between items-center">
                    <div>
                      <h3 className="text-xl font-semibold text-white">
                        Assignment #{assignment.assign_id}
                      </h3>
                      <p className="text-indigo-200 text-sm mt-1">
                        Weight: {assignment.weight}% of final grade
                      </p>
                    </div>

                    {user.role === 'student' && (
                      <button
                        onClick={() => openSubmitModal(assignment)}
                        className="bg-white text-indigo-600 px-4 py-2 rounded-lg hover:bg-indigo-50 font-medium"
                      >
                        {studentSubmission ? '📝 Resubmit Assignment' : '📝 Submit Assignment'}
                      </button>
                    )}
                  </div>
                </div>

                {user.role === 'student' && (
                  <div className="p-4 bg-gray-50">
                    {studentSubmission ? (
                      <div className="space-y-2">
                        <div className="flex justify-between items-center">
                          <p className="text-sm text-gray-600">
                            📅 Submitted: {studentSubmission.submission_date
                              ? new Date(studentSubmission.submission_date).toLocaleString()
                              : 'Not submitted'}
                          </p>
                          {studentSubmission.submission_grade && (
                            <div className="bg-green-100 px-3 py-1 rounded-full">
                              <span className="font-semibold text-green-700">
                                Grade: {studentSubmission.submission_grade}%
                              </span>
                            </div>
                          )}
                        </div>
                        {studentSubmission.submission_content && (
                          <div className="mt-2 p-3 bg-white rounded border">
                            <p className="text-sm text-gray-700 font-medium mb-1">Your Submission:</p>
                            <p className="text-sm text-gray-600">{studentSubmission.submission_content}</p>
                          </div>
                        )}
                      </div>
                    ) : (
                      <div className="text-center py-4">
                        <p className="text-gray-500">You haven't submitted this assignment yet.</p>
                        <button
                          onClick={() => openSubmitModal(assignment)}
                          className="mt-2 text-indigo-600 hover:underline font-medium"
                        >
                          Click here to submit →
                        </button>
                      </div>
                    )}
                  </div>
                )}

                {user.role === 'lecturer' && (
                  <div className="p-4">
                    <h4 className="font-semibold text-gray-700 mb-3">
                      Student Submissions ({students.length})
                    </h4>
                    {students.length === 0 ? (
                      <p className="text-gray-500 text-center py-4">No students enrolled in this course yet.</p>
                    ) : (
                      <div className="space-y-2 max-h-96 overflow-y-auto">
                        {students.map((student) => {
                          const submission = assignmentSubmissions[assignment.assign_id]?.find(
                            s => s.student_id == student.student_id
                          );
                          return (
                            <div key={student.student_id} className="flex justify-between items-center p-3 bg-gray-50 rounded-lg hover:bg-gray-100">
                              <div className="flex-1">
                                <span className="font-medium">{student.first_name} {student.last_name}</span>
                                <span className="text-sm text-gray-500 ml-2">ID: {student.student_id}</span>
                                {submission?.submission_date && (
                                  <p className="text-xs text-gray-400 mt-1">
                                    Submitted: {new Date(submission.submission_date).toLocaleString()}
                                  </p>
                                )}
                                {submission?.submission_content && (
                                  <p className="text-xs text-gray-500 mt-1 italic">
                                    "{submission.submission_content.substring(0, 50)}..."
                                  </p>
                                )}
                              </div>
                              <div className="flex items-center gap-3">
                                {submission?.submission_grade && (
                                  <span className="text-sm font-semibold text-green-600">
                                    {submission.submission_grade}%
                                  </span>
                                )}
                                <button
                                  onClick={() => {
                                    setSelectedAssignment(assignment);
                                    setSelectedStudent(student.student_id);
                                    setShowGradeModal(true);
                                  }}
                                  className="bg-indigo-600 text-white px-3 py-1 rounded text-sm hover:bg-indigo-700"
                                  disabled={!submission}
                                >
                                  {!submission ? 'No Submission' : (submission?.submission_grade ? 'Update Grade' : 'Grade')}
                                </button>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {console.log('Should show modal?', showSubmitModal, selectedAssignment)}
      {showCreateModal && (
        <CreateAssignmentModal
          courseCode={courseCode}
          onClose={() => setShowCreateModal(false)}
          onAssignmentCreated={handleAssignmentCreated}
        />
      )}

      {showSubmitModal && selectedAssignment && (
        <SubmitAssignment
          assignmentId={selectedAssignment.assign_id}
          onSubmitted={handleAssignmentSubmitted}
          onClose={() => {
            setShowSubmitModal(false);
            setSelectedAssignment(null);
          }}
        />
      )}

      {showGradeModal && selectedAssignment && selectedStudent && (
        <GradeAssignment
          assignmentId={selectedAssignment.assign_id}
          studentId={selectedStudent}
          onGraded={handleGradeSuccess}
          onClose={() => {
            setShowGradeModal(false);
            setSelectedStudent(null);
            setSelectedAssignment(null);
          }}
        />
      )}
    </div>
  );
};

export default AssignmentList;