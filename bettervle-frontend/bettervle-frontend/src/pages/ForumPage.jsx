import { useParams } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import ForumList from '../components/Forum/ForumList';

const ForumPage = () => {
  const { courseCode } = useParams();
  const { user } = useAuth();

  if (!user) {
    return <div className="text-center py-10">Please login to view forums.</div>;
  }

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-3xl font-bold">Discussion Forums</h1>
        <p className="text-gray-600 mt-2">
          Course: <span className="font-semibold">{courseCode}</span>
        </p>
      </div>

      <ForumList courseCode={courseCode} />
    </div>
  );
};

export default ForumPage;