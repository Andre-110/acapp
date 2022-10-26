from django.http import HttpResponse

def index(request):
    line1 = '<h1 style="text-align: center">术士之战</h1>'
    line4 = '<a href="/game/play/">进入游戏界面</a>'
    line3 = '<hr>'
    line2 = '<img src="https://bkimg.cdn.bcebos.com/pic/c2cec3fdfc039245efdd58288f94a4c27d1e25a8?x-bce-process=image/resize,m_lfit,w_536,limit_1" width=2000>'
    return HttpResponse(line1+line2+line3+line4)

def play(request):
    line1 = '<h1 style="text-align: center">游戏界面</h1>'
    line3 = '<a href="/game/">返回主界面</a>'
    line2 = '<img src="https://bkimg.cdn.bcebos.com/pic/55e736d12f2eb938ace703bad5628535e4dd6feb?x-bce-process=image/watermark,image_d2F0ZXIvYmFpa2U4MA==,g_7,xp_5,yp_5" width=2000>'
    return HttpResponse(line1+line2+line3)
