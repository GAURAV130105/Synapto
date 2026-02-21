import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Plus, BookOpen, PlayCircle, Clock, TrendingUp, BarChart3, Flame, CheckCircle2 } from 'lucide-react'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'

// Calculate learning streak from activity dates
function calculateStreak(activityDates: string[]): number {
  if (!activityDates || activityDates.length === 0) return 0

  // Get unique dates (YYYY-MM-DD), sorted descending
  const uniqueDates = [...new Set(
    activityDates.map(d => new Date(d).toISOString().split('T')[0])
  )].sort((a, b) => b.localeCompare(a))

  if (uniqueDates.length === 0) return 0

  const today = new Date().toISOString().split('T')[0]
  const yesterday = new Date(Date.now() - 86400000).toISOString().split('T')[0]

  // Streak must include today or yesterday
  if (uniqueDates[0] !== today && uniqueDates[0] !== yesterday) return 0

  let streak = 1
  for (let i = 1; i < uniqueDates.length; i++) {
    const current = new Date(uniqueDates[i - 1])
    const prev = new Date(uniqueDates[i])
    const diffDays = Math.round((current.getTime() - prev.getTime()) / 86400000)

    if (diffDays === 1) {
      streak++
    } else {
      break
    }
  }

  return streak
}

export default async function DashboardPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  // Fetch profile
  const { data: profile } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user!.id)
    .single()

  // Fetch recently saved content
  const { data: savedContent } = await supabase
    .from('saved_content')
    .select(`
      id,
      content_id,
      created_at,
      content (
        id,
        title,
        description,
        youtube_url,
        thumbnail_url,
        transcript_status,
        duration_seconds,
        created_at
      )
    `)
    .eq('user_id', user!.id)
    .order('created_at', { ascending: false })
    .limit(6)

  // Fetch activity stats
  const { count: totalSaved } = await supabase
    .from('saved_content')
    .select('id', { count: 'exact', head: true })
    .eq('user_id', user!.id)

  const { count: totalActivities } = await supabase
    .from('user_activity')
    .select('id', { count: 'exact', head: true })
    .eq('user_id', user!.id)

  // Fetch activity dates for streak calculation (last 90 days)
  const ninetyDaysAgo = new Date(Date.now() - 90 * 86400000).toISOString()
  const { data: activityDates } = await supabase
    .from('user_activity')
    .select('created_at')
    .eq('user_id', user!.id)
    .gte('created_at', ninetyDaysAgo)
    .order('created_at', { ascending: false })

  const streak = calculateStreak(
    activityDates?.map((a: any) => a.created_at) || []
  )

  // Count unique content items viewed (content_view activities)
  const { data: viewActivities } = await supabase
    .from('user_activity')
    .select('metadata')
    .eq('user_id', user!.id)
    .in('activity_type', ['content_view', 'voice_command', 'voice_youtube_search'])

  // Count completed: unique content items the user has interacted with
  const completedSet = new Set<string>()
  viewActivities?.forEach((a: any) => {
    if (a.metadata?.content_id) completedSet.add(a.metadata.content_id)
  })
  const completedCount = completedSet.size || totalSaved || 0

  // Build recent activity list for Learning Progress tab
  const { data: recentActivities } = await supabase
    .from('user_activity')
    .select('activity_type, metadata, created_at')
    .eq('user_id', user!.id)
    .order('created_at', { ascending: false })
    .limit(15)

  // Build streak calendar (last 7 days)
  const last7Days: { date: string; label: string; active: boolean }[] = []
  const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']
  const activityDateSet = new Set(
    activityDates?.map((a: any) => new Date(a.created_at).toISOString().split('T')[0]) || []
  )
  for (let i = 6; i >= 0; i--) {
    const d = new Date(Date.now() - i * 86400000)
    const dateStr = d.toISOString().split('T')[0]
    last7Days.push({
      date: dateStr,
      label: dayNames[d.getDay()],
      active: activityDateSet.has(dateStr),
    })
  }

  const displayName = profile?.first_name || user?.user_metadata?.first_name || 'Learner'

  // Log a dashboard visit as activity (for streak tracking)
  try {
    await supabase.from('user_activity').insert({
      user_id: user!.id,
      activity_type: 'dashboard_visit',
      metadata: { page: 'dashboard' },
    })
  } catch {}

  return (
    <div className="space-y-8">
      {/* Welcome Section */}
      <div className="space-y-2">
        <h1 className="text-3xl font-bold text-foreground">
          Welcome back, {displayName}!
        </h1>
        <p className="text-muted-foreground">Your personalized learning dashboard</p>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card className="p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
              <BookOpen className="w-5 h-5 text-primary" />
            </div>
            <div>
              <p className="text-2xl font-bold text-foreground">{totalSaved || 0}</p>
              <p className="text-xs text-muted-foreground">Saved Content</p>
            </div>
          </div>
        </Card>
        <Card className="p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-accent/10 flex items-center justify-center">
              <TrendingUp className="w-5 h-5 text-accent" />
            </div>
            <div>
              <p className="text-2xl font-bold text-foreground">{totalActivities || 0}</p>
              <p className="text-xs text-muted-foreground">Activities</p>
            </div>
          </div>
        </Card>
        <Card className="p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-orange-500/10 flex items-center justify-center">
              <Flame className="w-5 h-5 text-orange-500" />
            </div>
            <div>
              <p className="text-2xl font-bold text-foreground">
                {streak > 0 ? `${streak} 🔥` : '0'}
              </p>
              <p className="text-xs text-muted-foreground">
                {streak > 0 ? `Day${streak > 1 ? 's' : ''} Streak` : 'Start a streak!'}
              </p>
            </div>
          </div>
        </Card>
        <Card className="p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-emerald-500/10 flex items-center justify-center">
              <CheckCircle2 className="w-5 h-5 text-emerald-500" />
            </div>
            <div>
              <p className="text-2xl font-bold text-foreground">{completedCount}</p>
              <p className="text-xs text-muted-foreground">Completed</p>
            </div>
          </div>
        </Card>
      </div>

      {/* Quick Actions */}
      <div className="grid md:grid-cols-3 gap-4">
        <Link href="/dashboard/add-content">
          <Card className="p-6 hover:bg-primary/5 transition-colors cursor-pointer">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center">
                <Plus className="w-6 h-6 text-primary" />
              </div>
              <div>
                <h3 className="font-semibold text-foreground">Add Content</h3>
                <p className="text-sm text-muted-foreground">Add YouTube videos</p>
              </div>
            </div>
          </Card>
        </Link>

        <Link href="/dashboard/preferences">
          <Card className="p-6 hover:bg-accent/5 transition-colors cursor-pointer">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-lg bg-accent/10 flex items-center justify-center">
                <PlayCircle className="w-6 h-6 text-accent" />
              </div>
              <div>
                <h3 className="font-semibold text-foreground">Accessibility</h3>
                <p className="text-sm text-muted-foreground">Customize settings</p>
              </div>
            </div>
          </Card>
        </Link>

        <Link href="/dashboard/library">
          <Card className="p-6 hover:bg-secondary/5 transition-colors cursor-pointer">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-lg bg-secondary/10 flex items-center justify-center">
                <BookOpen className="w-6 h-6 text-secondary" />
              </div>
              <div>
                <h3 className="font-semibold text-foreground">My Library</h3>
                <p className="text-sm text-muted-foreground">View all content</p>
              </div>
            </div>
          </Card>
        </Link>
      </div>

      {/* Tabs Section */}
      <Tabs defaultValue="recent" className="space-y-4">
        <TabsList>
          <TabsTrigger value="recent">Recently Saved</TabsTrigger>
          <TabsTrigger value="progress">Learning Progress</TabsTrigger>
          <TabsTrigger value="recommendations">Recommended</TabsTrigger>
        </TabsList>

        <TabsContent value="recent" className="space-y-4">
          {savedContent && savedContent.length > 0 ? (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
              {savedContent.map((item: any) => (
                <Link key={item.id} href={`/dashboard/content/${item.content.id}`}>
                  <Card className="overflow-hidden hover:shadow-lg transition-shadow cursor-pointer">
                    <div className="aspect-video bg-muted flex items-center justify-center relative">
                      {item.content.thumbnail_url ? (
                        <img
                          src={item.content.thumbnail_url}
                          alt={item.content.title}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <PlayCircle className="w-12 h-12 text-muted-foreground opacity-50" />
                      )}
                    </div>
                    <div className="p-4">
                      <h3 className="font-semibold text-foreground truncate text-sm">
                        {item.content.title}
                      </h3>
                      <p className="text-xs text-muted-foreground mt-2">
                        <Clock className="w-3 h-3 inline mr-1" />
                        {item.content.duration_seconds
                          ? `${Math.floor(item.content.duration_seconds / 60)} min`
                          : 'Duration unknown'}
                      </p>
                    </div>
                  </Card>
                </Link>
              ))}
            </div>
          ) : (
            <Card className="p-12 text-center">
              <BookOpen className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-muted-foreground mb-4">No saved content yet</p>
              <Link href="/dashboard/add-content">
                <Button>Add Your First Content</Button>
              </Link>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="progress" className="space-y-4">
          {/* Streak Calendar */}
          <Card className="p-6">
            <div className="flex items-center gap-2 mb-4">
              <Flame className="w-5 h-5 text-orange-500" />
              <h3 className="font-semibold text-foreground">
                {streak > 0 ? `${streak}-Day Learning Streak 🔥` : 'Start Your Streak!'}
              </h3>
            </div>
            <p className="text-sm text-muted-foreground mb-4">
              {streak > 0
                ? 'Keep learning every day to maintain your streak!'
                : 'Visit the dashboard, search for videos, or save content daily to build a streak.'}
            </p>
            <div className="flex items-center justify-between gap-2">
              {last7Days.map((day) => (
                <div key={day.date} className="flex flex-col items-center gap-1">
                  <div
                    className={`w-10 h-10 rounded-xl flex items-center justify-center text-sm font-bold transition-all ${
                      day.active
                        ? 'bg-gradient-to-br from-orange-400 to-red-500 text-white shadow-lg shadow-orange-500/30'
                        : 'bg-muted text-muted-foreground'
                    }`}
                  >
                    {day.active ? '🔥' : '·'}
                  </div>
                  <span className="text-[10px] text-muted-foreground font-medium">{day.label}</span>
                </div>
              ))}
            </div>
          </Card>

          {/* Recent Activity */}
          <Card className="p-6">
            <h3 className="font-semibold text-foreground mb-4 flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-primary" />
              Recent Activity
            </h3>
            {recentActivities && recentActivities.length > 0 ? (
              <div className="space-y-3">
                {recentActivities.map((activity: any, idx: number) => {
                  const actType = activity.activity_type || 'unknown'
                  const meta = activity.metadata || {}
                  const timeAgo = getTimeAgo(activity.created_at)

                  let icon = '📝'
                  let label = actType.replace(/_/g, ' ')

                  if (actType === 'voice_command') {
                    icon = '🎤'
                    label = `Voice: "${meta.transcript || 'command'}"`
                  } else if (actType === 'voice_youtube_search') {
                    icon = '🔍'
                    label = `Searched: "${meta.query || 'videos'}"`
                  } else if (actType === 'dashboard_visit') {
                    icon = '📊'
                    label = 'Visited dashboard'
                  } else if (actType === 'content_view') {
                    icon = '▶️'
                    label = 'Viewed content'
                  } else if (actType === 'content_save') {
                    icon = '💾'
                    label = 'Saved content'
                  }

                  return (
                    <div
                      key={idx}
                      className="flex items-center gap-3 py-2 border-b border-border/50 last:border-0"
                    >
                      <span className="text-lg">{icon}</span>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm text-foreground truncate">{label}</p>
                      </div>
                      <span className="text-[10px] text-muted-foreground whitespace-nowrap">
                        {timeAgo}
                      </span>
                    </div>
                  )
                })}
              </div>
            ) : (
              <p className="text-sm text-muted-foreground text-center py-4">
                No activity yet. Start by searching for videos or adding content!
              </p>
            )}
          </Card>
        </TabsContent>

        <TabsContent value="recommendations">
          <Card className="p-8 text-center">
            <BarChart3 className="w-12 h-12 text-muted-foreground mx-auto mb-4 opacity-50" />
            <p className="text-muted-foreground">Personalized recommendations coming soon!</p>
            <p className="text-xs text-muted-foreground mt-2">
              Keep adding content to get AI-powered recommendations based on your learning patterns.
            </p>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}

function getTimeAgo(dateStr: string): string {
  const now = Date.now()
  const then = new Date(dateStr).getTime()
  const diffMs = now - then
  const diffMins = Math.floor(diffMs / 60000)
  const diffHrs = Math.floor(diffMs / 3600000)
  const diffDays = Math.floor(diffMs / 86400000)

  if (diffMins < 1) return 'just now'
  if (diffMins < 60) return `${diffMins}m ago`
  if (diffHrs < 24) return `${diffHrs}h ago`
  if (diffDays < 7) return `${diffDays}d ago`
  return new Date(dateStr).toLocaleDateString()
}
