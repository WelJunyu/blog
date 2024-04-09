---
title: 实现自己的简易 Container
description: "本文将会仿照 Docker Container 现有的基本功能，用 Go 简单地实现自己的 Mini Container。"
authors: [WelJunyu]
tags: [Docker,Linux,Go]
date: 2023-7-14
---

## 目的

本文将会仿照 Docker Container 现有的基本功能，用 Go 简单地实现自己的 Mini Container。后续章节逐步使用 Linux 的 Namespace 和 CGroups 对 Container 与宿主机进行隔离。Namespace 决定了 Container 能看见什么？CGroups 决定了 Container 能使用什么？

```go
// docker         run image <cmd> <params>
// go run main.go run       <cmd> <params>
```

<!--truncate-->

## 预备工作

先搭建起基本的框架，程序必须以 `run`  作为第一个参数，`run` 后面的参数为将要执行的程序和传入该程序的参数。

```go
func main() {
	switch os.Args[1] {
	case "run":
		run()
	default:
		panic("bad command")
	}
}

func run() {
	fmt.Printf("Running %v\n", os.Args[2:])

	cmd := exec.Command(os.Args[2], os.Args[3:]...)
	cmd.Stdin = os.Stdin
	cmd.Stdout = os.Stdout
	cmd.Stderr = os.Stderr

	if err := cmd.Run(); err != nil {
		fmt.Println("Error", err)
		os.Exit(1)
	}
}
```

此时运行 `go run main.go run echo Helloworld` ，如果终端的输出和下面的代码一样，则证明代码已经能让参数中的程序正常的执行了：

```bash
root@laptop:/⚡ go run main.go run echo HelloWorld
Running [echo HelloWorld]
HelloWorld
```

如果当前开发环境的账号不是 root，后续执行 bash 时需要用 sudo 执行，也别忘了在 `/etc/sudoers` 添加 Go 的环境变量。

```bash
......
Defaults        secure_path="/usr/local/sbin:......:/usr/local/go/bin"
......
```

## Namespace

Namespace 决定了 Container 能看见什么？

### UTS

UTS (UNIX Time-Sharing) namespace 允许单个系统对不同的进程具有不同的 hostname 和 domain name。 “当一个进程创建一个新的 UTS 命名空间时，新 UTS 命名空间的 hostname 和 domain 是从调用者的 UTS namespace 中的相应值复制而来的。”（[Linux namespaces - Wikipedia](https://en.wikipedia.org/wiki/Linux_namespaces#UTS)）

```go
func run() {
	fmt.Printf("Running %v\n", os.Args[2:])

	cmd := exec.Command(os.Args[2], os.Args[3:]...)
	cmd.Stdin = os.Stdin
	cmd.Stdout = os.Stdout
	cmd.Stderr = os.Stderr

	cmd.SysProcAttr = &syscall.SysProcAttr{
		Cloneflags: syscall.CLONE_NEWUTS,
	}

	if err := cmd.Run(); err != nil {
		fmt.Println("Error", err)
		os.Exit(1)
	}
}
```

```bash
root@laptop:/⚡ go run main.go run bash
root@laptop:/⚡ hostname container
root@laptop:/⚡ hostname
container
```

```bash
root@laptop:/⚡ hostname
laptop
root@laptop:/⚡ hostname # after runner change
laptop # unchanged
```

可以简单的检验一下，使用刚刚编写的 Go 程序启动一个 bash。在该 bash 里修改 hostname，但外部并没有影响到宿主机的 hostname。

Container 里虽然修改了 hostname，但 bash 里仍然显示的是 laptop。可以尝试在启动 Container bash 时，修改 hostname 为 container，以便更好的认出现在是哪个终端。

如果在这里修改的是宿主机的 hostname，不是 Container 的 hostname，虽然也能达到上述的需求，但真不合适。

```go
func run() {
	......

	cmd.SysProcAttr = &syscall.SysProcAttr{
		Cloneflags: syscall.CLONE_NEWUTS,
	}

	// add
	syscall.Sethostname([]byte("container"))

	if err := cmd.Run(); err != nil {
	......
	}
}
```

namespace 将会从调用者那里继承，有一种思路：run 进程的运行环境是宿主机的，在 run 的执行代码里修改 hostname 是修改宿主机的。不如让 run 进程再创建一个子进程 child，child 进程会继承 run 进程的 namespace，之后 child 执行代码里再修改 hostname，改变的是 run 进程提供的 namespace，就不会影响宿主机的 hostname。

```go
func main() {
	switch os.Args[1] {
	case "run":
		run()
	case "child":
		child()
	default:
		panic("bad command")
	}
}

func run() {
	fmt.Printf("Running %v\n", os.Args[2:])

	cmd := exec.Command("/proc/self/exe", append([]string{"child"}, os.Args[2:]...)...)
	cmd.Stdin = os.Stdin
	cmd.Stdout = os.Stdout
	cmd.Stderr = os.Stderr

	cmd.SysProcAttr = &syscall.SysProcAttr{
		Cloneflags: syscall.CLONE_NEWUTS,
	}

	if err := cmd.Run(); err != nil {
		fmt.Println("Error", err)
		os.Exit(1)
	}
}

func child() {
	fmt.Printf("Running %v\n", os.Args[2:])

	syscall.Sethostname([]byte("container"))

	cmd := exec.Command(os.Args[2], os.Args[3:]...)
	cmd.Stdin = os.Stdin
	cmd.Stdout = os.Stdout
	cmd.Stderr = os.Stderr

	if err := cmd.Run(); err != nil {
		fmt.Println("Error", err)
		os.Exit(1)
	}
}
```

### NEWPID

现在尝试隔离 pid，在 run 函数的中 `cmd.SysProcAttr` 尝试添加 `syscall.CLONE_NEWPID`：

```go
func run() {
	......

	cmd.SysProcAttr = &syscall.SysProcAttr{
		Cloneflags: syscall.CLONE_NEWUTS| syscall.CLONE_NEWPID,
	}

	if err := cmd.Run(); err != nil {
	......
	}
}
```

```bash
root@laptop:/⚡ go run main.go run bash
Running [bash] as 5611
Running [bash] as 1
root@container:/⚡ ps
PID TTY          TIME CMD
 5490 pts/3    00:00:00 sudo
 5506 pts/3    00:00:00 go
 5611 pts/3    00:00:00 main
 5616 pts/3    00:00:00 exe
 5621 pts/3    00:00:00 bash
 5655 pts/3    00:00:00 ps
```

会惊喜地发现，将 pid 隔离了，但 ps 命令并没有显示正确的程序列表。这是因为 ps 不能魔法般地直接获取程序的信息，相反，它是从 /proc 目录下读取这些信息的。（尝试 `ls /proc` 看看）

现在宿主机下的 /proc 目录和 Container 下 /proc 目录是一致的，接下来要做的是让它俩看到的 /proc 目录不一致。

想办法准备一个 linux 文件系统，我的方法是用 docker ubuntu 的镜像，直接使用 docker cp 命令将根目录以其所有子文件拷贝到宿主机的某个文件夹里。接着稍微改动一下 child 代码，使用 `chroot` 改变 Container 的根目录，使用 `chdir` 将当前的工作目录改成 `/`：

```go
func child() {
	fmt.Printf("Running %v as %d\n", os.Args[2:], os.Getpid())

	syscall.Sethostname([]byte("container"))
	syscall.Chroot("...../mnctn/ubuntu-fs") // change this yourself
	syscall.Chdir("/")

	cmd := exec.Command(os.Args[2], os.Args[3:]...)
	cmd.Stdin = os.Stdin
	cmd.Stdout = os.Stdout
	cmd.Stderr = os.Stderr

	if err := cmd.Run(); err != nil {
		fmt.Println("Error", err)
		os.Exit(1)
	}
}
```

使用 `sleep 100` 命令将 Container 阻塞一会，可以在宿主机查看使用的是哪一个文件系统。

```bash
root@laptop:/⚡ ps -C sleep
PID TTY          TIME CMD
 9609 pts/3    00:00:00 sleep
root@laptop:/⚡ ls -l /proc/9609/root
lrwxrwxrwx 1 root root 0 Jul 14 18:32 /proc/9609/root -> ....../mnctn/ubuntu-fs
```

如果你在 Container 中使用 ps 命令，就会知道下一步需要做什么了。

```bash
root@container:/⚡ ps
Error, do this: mount -t proc proc /proc
```

proc 是一个伪文件系统，它提供一种机制让内核态和用户态共享一些信息。现在需要将 /proc 挂载，让内核知道该从哪里获取进程信息。

```bash
root@laptop:/⚡ sudo go run main.go run bash
Running [bash] as 10612
Running [bash] as 1
root@container:/⚡ ps
  PID TTY          TIME CMD
    1 ?        00:00:00 exe
    6 ?        00:00:00 bash
    9 ?        00:00:00 ps
```

### NEWNS

在 Container 中能使用 mount 命令看看挂载了什么，但是宿主机中的 mount 命令，也能看见 Container 中挂载的信息，这个挂载信息 Container 与宿主机并没有隔离。

```bash
root@container:/⚡ mount
proc on /proc type proc (rw,relatime)
```

```bash
root@laptop:/⚡ mount | grep proc
proc on /proc type proc (rw,nosuid,nodev,noexec,noatime)
binfmt_misc on /proc/sys/fs/binfmt_misc type binfmt_misc (rw,relatime)
proc on /home/wjy/workspace/mnctn/ubuntu-fs/proc type proc (rw,relatime)
```

隔离挂载点可以使用。Mount namespace 控制挂载点。在创建时，当前 mount namespace 中的挂载被复制到新 namespace，但之后创建的挂载点不会在 namespace 之间传播。（[Linux namespaces - Wikipedia](https://en.wikipedia.org/wiki/Linux_namespaces#Mount)）

它的 clone_flag 是 `CLONE_NEWNS`，这个术语不是描述性的（它没有说明要创建哪种 namespace），因为 mount namespace 是第一种 namespace，设计人员没有预料到还有其他 namespace。

```go
func run() {
	......

	cmd.SysProcAttr = &syscall.SysProcAttr{
		Cloneflags: syscall.CLONE_NEWUTS| syscall.CLONE_NEWPID | syscall.CLONE_NEWNS,
		Unshareflags: syscall.CLONE_NEWNS,
	}

	if err := cmd.Run(); err != nil {
	......
	}
}
```

这样在宿主机就不能看到 Container 的挂载信息了，以免后续有成千上百个 Container 后，宿主机看到那一堆 mount 信息头就大。Container 内部也无需关心宿主机的挂载信息。

```bash
root@container:/⚡ mount
proc on /proc type proc (rw,relatime)
```

```bash
root@laptop:/⚡ mount | grep proc
proc on /proc type proc (rw,nosuid,nodev,noexec,noatime)
binfmt_misc on /proc/sys/fs/binfmt_misc type binfmt_misc (rw,relatime)
```

## CGroups

CGroups 决定了 Container 能使用什么？它能限制使用的内存、CPU、或进程数、I/O 带宽上限等。CGroups 相关的限制信息可以在 `/sys/fs/cgroup` 目录中看到。

例如查看当前允许使用的内存上限：

```bash
root@laptop:/⚡ cat /sys/fs/cgroup/memory/memory.limit_in_bytes
9223372036854771712
```

让 Docker 运行一个限制内存空间的容器，在 /sys/fs/cgroup/docker 目录中查看该容器限制的内存信息。记下该容器 ID 的前缀，853e72c 开头。在 /sys/fs/cgroup/docker 目录找到对应前缀的容器 ID 文件夹，即可获取对应限制的信息。

```bash
root@laptop:/⚡ docker run --rm -it --memory=10M ubuntu:20.04 /bin/bash
root@853e72c61a76:/#
```

```bash
root@laptop:/⚡ cat /sys/fs/cgroup/memory/docker/853e72c61a76/memory.limit_in_bytes
10485760
```

接下来就要做与 Docker 一样的工作，打算限制一下进程数量。

```go
func child() {
	......

	cg()

	syscall.Sethostname([]byte("container"))
	syscall.Chroot("/home/wjy/workspace/mnctn/ubuntu-fs")
	syscall.Chdir("/")
	syscall.Mount("proc", "proc", "proc", 0, "")

	......
}

func cg() {
	cgroups := "/sys/fs/cgroup"
	pids := filepath.Join(cgroups, "pids")
	err := os.Mkdir(filepath.Join(pids, "mnctn"), 0755)
	if err != nil && !os.IsExist(err) {
		panic(err)
	}
	must(ioutil.WriteFile(filepath.Join(pids, "mnctn/pids.max"), []byte("20"), 0700))
	// Removes the new cgroup in place after the container exits
	must(ioutil.WriteFile(filepath.Join(pids, "mnctn/notify_on_release"), []byte("1"), 0700))
	must(ioutil.WriteFile(filepath.Join(pids, "mnctn/cgroup.procs"), []byte(strconv.Itoa(os.Getpid())), 0700))
}
```

同样地，先启动 Container，后让 Container sleep 100，宿主机查看其在 CGroups 中限制进程数量信息。

```bash
root@container:/⚡ sleep 100
```

```bash
root@laptop:/⚡ cat /sys/fs/cgroup/pids/mnctn/pids.max
20
```

虽然显示限制进程数量是 20 了，但还得用一些东西测一下：（当时我看到这一行的时候笑死了，其实它是一个错误炸弹，该函数不断递归地调用自己创建进程）真希望它能被我们刚刚编写的 CGroups 限制住。

```bash
:() { : | : & } ; :
```

```bash
root@container:/⚡ :() { : | : & } ; :
......
bash: fork: retry: Resource temporarily unavailable
bash: fork: retry: Resource temporarily unavailable
bash: fork: retry: Resource temporarily unavailable
bash: fork: retry: Resource temporarily unavailable
bash: fork: retry: Resource temporarily unavailable
bash: fork: retry: Resource temporarily unavailable
bash: fork: retry: Resource temporarily unavailable
```

现在可以在宿主机查看一些关于该容器 CGroups 的信息，CGroups 它起作用了：

```bash
root@laptop:/ cat /sys/fs/cgroup/pids/mnctn/pids.current
20
root@laptop:/ cat /sys/fs/cgroup/pids/mnctn/tasks
16563
16564
16565
16566
16567
16568
root@laptop:/ ps fax # 查看进程树形信息（略）

```

## 参考

本文绝大部分内容来自：[(7) Containers From Scratch • Liz Rice • GOTO 2018 - YouTube](https://www.youtube.com/watch?v=8fi7uSYlOdc)