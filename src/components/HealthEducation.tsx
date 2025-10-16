import { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { supabase, HealthTopic, HealthArticle } from '../lib/supabase';
import { BookOpen, Clock, X, Bookmark, BookmarkCheck } from 'lucide-react';

interface ArticleWithTopic extends HealthArticle {
  topic?: HealthTopic;
  isRead?: boolean;
  isBookmarked?: boolean;
}

export function HealthEducation() {
  const { user } = useAuth();
  const [topics, setTopics] = useState<HealthTopic[]>([]);
  const [articles, setArticles] = useState<ArticleWithTopic[]>([]);
  const [selectedTopic, setSelectedTopic] = useState<string | null>(null);
  const [selectedArticle, setSelectedArticle] = useState<ArticleWithTopic | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadTopicsAndArticles();
  }, []);

  const loadTopicsAndArticles = async () => {
    try {
      const { data: topicsData, error: topicsError } = await supabase
        .from('health_topics')
        .select('*')
        .order('order_index', { ascending: true });

      if (topicsError) throw topicsError;
      setTopics(topicsData || []);

      const { data: articlesData, error: articlesError } = await supabase
        .from('health_articles')
        .select('*, health_topics(*)')
        .order('published_at', { ascending: false });

      if (articlesError) throw articlesError;

      const { data: progressData } = await supabase
        .from('user_article_progress')
        .select('*')
        .eq('user_id', user?.id);

      const enrichedArticles = articlesData?.map(article => ({
        ...article,
        topic: (article as any).health_topics,
        isRead: progressData?.some(p => p.article_id === article.id) || false,
        isBookmarked: progressData?.find(p => p.article_id === article.id)?.bookmarked || false,
      })) || [];

      setArticles(enrichedArticles);
    } catch (error) {
      console.error('Error loading health education:', error);
    } finally {
      setLoading(false);
    }
  };

  const markAsRead = async (articleId: string) => {
    if (!user) return;

    try {
      const { error } = await supabase
        .from('user_article_progress')
        .upsert({
          user_id: user.id,
          article_id: articleId,
          read_at: new Date().toISOString(),
        }, {
          onConflict: 'user_id,article_id',
        });

      if (error) throw error;
      await loadTopicsAndArticles();
    } catch (error) {
      console.error('Error marking article as read:', error);
    }
  };

  const toggleBookmark = async (articleId: string, currentBookmarked: boolean) => {
    if (!user) return;

    try {
      const { error } = await supabase
        .from('user_article_progress')
        .upsert({
          user_id: user.id,
          article_id: articleId,
          bookmarked: !currentBookmarked,
        }, {
          onConflict: 'user_id,article_id',
        });

      if (error) throw error;
      await loadTopicsAndArticles();
    } catch (error) {
      console.error('Error toggling bookmark:', error);
    }
  };

  const openArticle = (article: ArticleWithTopic) => {
    setSelectedArticle(article);
    markAsRead(article.id);
  };

  const filteredArticles = selectedTopic
    ? articles.filter(a => a.topic_id === selectedTopic)
    : articles;

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-gray-600">Loading...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Health Education</h2>
        <p className="text-gray-600">
          Learn about managing chronic conditions, healthy living, and medication safety
        </p>
      </div>

      <div className="flex gap-2 flex-wrap">
        <button
          onClick={() => setSelectedTopic(null)}
          className={`px-4 py-2 rounded-lg font-medium transition ${
            selectedTopic === null
              ? 'bg-teal-500 text-white'
              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
          }`}
        >
          All Topics
        </button>
        {topics.map(topic => (
          <button
            key={topic.id}
            onClick={() => setSelectedTopic(topic.id)}
            className={`px-4 py-2 rounded-lg font-medium transition ${
              selectedTopic === topic.id
                ? 'bg-teal-500 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            {topic.title}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {filteredArticles.map(article => (
          <div
            key={article.id}
            className="bg-white border-2 border-gray-200 rounded-xl p-5 hover:border-teal-300 transition cursor-pointer"
            onClick={() => openArticle(article)}
          >
            <div className="flex items-start justify-between mb-3">
              <div className="flex-1">
                <h3 className="text-lg font-semibold text-gray-900 mb-1">
                  {article.title}
                </h3>
                <p className="text-sm text-teal-600 font-medium">
                  {article.topic?.title}
                </p>
              </div>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  toggleBookmark(article.id, article.isBookmarked || false);
                }}
                className="ml-2"
              >
                {article.isBookmarked ? (
                  <BookmarkCheck className="w-5 h-5 text-teal-500" />
                ) : (
                  <Bookmark className="w-5 h-5 text-gray-400 hover:text-teal-500" />
                )}
              </button>
            </div>

            <p className="text-gray-600 text-sm mb-3">{article.summary}</p>

            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-xs text-gray-500">
                <Clock className="w-4 h-4" />
                {article.reading_time_minutes} min read
              </div>
              {article.isRead && (
                <span className="text-xs text-green-600 font-medium">Read</span>
              )}
            </div>
          </div>
        ))}
      </div>

      {selectedArticle && (
        <ArticleModal
          article={selectedArticle}
          onClose={() => setSelectedArticle(null)}
        />
      )}
    </div>
  );
}

function ArticleModal({ article, onClose }: { article: ArticleWithTopic; onClose: () => void }) {
  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50 overflow-y-auto">
      <div className="bg-white rounded-xl shadow-xl max-w-3xl w-full my-8">
        <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between rounded-t-xl">
          <div className="flex items-center gap-3">
            <BookOpen className="w-6 h-6 text-teal-500" />
            <div>
              <h2 className="text-2xl font-bold text-gray-900">{article.title}</h2>
              <p className="text-sm text-teal-600 font-medium">{article.topic?.title}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        <div className="px-6 py-6 max-h-[70vh] overflow-y-auto">
          <div className="flex items-center gap-4 mb-6 text-sm text-gray-600">
            <div className="flex items-center gap-1">
              <Clock className="w-4 h-4" />
              {article.reading_time_minutes} minute read
            </div>
            <div>
              Published {new Date(article.published_at).toLocaleDateString()}
            </div>
          </div>

          <div className="prose prose-lg max-w-none">
            {article.content.split('\n\n').map((paragraph, index) => {
              if (paragraph.startsWith('**') && paragraph.endsWith('**')) {
                return (
                  <h3 key={index} className="text-xl font-bold text-gray-900 mt-6 mb-3">
                    {paragraph.replace(/\*\*/g, '')}
                  </h3>
                );
              }

              if (paragraph.startsWith('*') && !paragraph.startsWith('**')) {
                return (
                  <h4 key={index} className="text-lg font-semibold text-gray-800 mt-4 mb-2">
                    {paragraph.replace(/^\*|\*$/g, '')}
                  </h4>
                );
              }

              if (paragraph.startsWith('-')) {
                const items = paragraph.split('\n').filter(line => line.startsWith('-'));
                return (
                  <ul key={index} className="list-disc list-inside space-y-1 mb-4">
                    {items.map((item, i) => (
                      <li key={i} className="text-gray-700">
                        {item.replace(/^-\s*/, '')}
                      </li>
                    ))}
                  </ul>
                );
              }

              return (
                <p key={index} className="text-gray-700 mb-4 leading-relaxed">
                  {paragraph}
                </p>
              );
            })}
          </div>
        </div>

        <div className="border-t border-gray-200 px-6 py-4 flex justify-end">
          <button
            onClick={onClose}
            className="px-6 py-2.5 bg-teal-500 text-white rounded-lg font-medium hover:bg-teal-600 transition"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
