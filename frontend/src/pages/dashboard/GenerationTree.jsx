import { useState, useEffect, useCallback } from 'react'
import { FiGitBranch, FiPlus, FiMinus, FiArrowLeft } from 'react-icons/fi'
import { useAuth } from '../../context/AuthContext'
import { getGenerationTree } from '../../api/user'

function getInitials(name) {
  if (!name) return '?'
  return name.split(' ').map((w) => w[0]).join('').toUpperCase().slice(0, 2)
}

function TreeNode({ node, onExpand, expandedNodes }) {
  const isExpanded = expandedNodes.has(node.tpeId)
  const hasChildren = node.children && node.children.length > 0
  const isLeaf = !node.children || node.children.length === 0

  return (
    <li className="tree-li">
      <div className="tree-node">
        <div className={`tree-avatar ${isLeaf ? 'tree-avatar--leaf' : 'tree-avatar--parent'}`}>
          {getInitials(node.fullName)}
        </div>
        <span className="tree-code">{node.tpeId}</span>
        <span className="tree-name">({node.fullName})</span>
        {!isLeaf && (
          <button
            className="tree-toggle"
            onClick={() => onExpand(node.tpeId)}
            title={isExpanded ? 'Collapse' : 'Expand'}
          >
            {isExpanded ? <FiMinus size={12} /> : <FiPlus size={12} />}
          </button>
        )}
      </div>
      {isExpanded && hasChildren && (
        <ul className="tree-children">
          {node.children.map((child) => (
            <TreeNode
              key={child.tpeId}
              node={child}
              onExpand={onExpand}
              expandedNodes={expandedNodes}
            />
          ))}
        </ul>
      )}
    </li>
  )
}

export default function GenerationTree() {
  const { user } = useAuth()
  const [tree, setTree] = useState(null)
  const [loading, setLoading] = useState(true)
  const [rootCode, setRootCode] = useState(null)
  const [expandedNodes, setExpandedNodes] = useState(new Set())

  const fetchTree = useCallback((code) => {
    setLoading(true)
    getGenerationTree(code)
      .then((res) => {
        setTree(res.data.data)
        if (res.data.data) {
          setExpandedNodes(new Set([res.data.data.tpeId]))
        }
      })
      .catch(() => setTree(null))
      .finally(() => setLoading(false))
  }, [])

  useEffect(() => {
    fetchTree(rootCode)
  }, [rootCode, fetchTree])

  const handleExpand = (code) => {
    setExpandedNodes((prev) => {
      const next = new Set(prev)
      if (next.has(code)) next.delete(code)
      else next.add(code)
      return next
    })
  }

  const resetToMyTree = () => setRootCode(null)

  return (
    <div className="dash-page">
      <div className="page-header">
        <h2 className="page-title"><FiGitBranch size={22} /> My Generation Tree</h2>
        {rootCode && (
          <button className="btn-outline" onClick={resetToMyTree}>
            <FiArrowLeft size={14} /> Back to My Tree
          </button>
        )}
      </div>

      {loading ? (
        <div className="dash-loader">Loading tree...</div>
      ) : !tree ? (
        <div className="empty-state">
          <FiGitBranch size={48} />
          <h3>No network data</h3>
          <p>Your generation tree will appear here as you grow your network.</p>
        </div>
      ) : (
        <div className="tree-container">
          <ul className="tree-root">
            <TreeNode node={tree} onExpand={handleExpand} expandedNodes={expandedNodes} />
          </ul>
        </div>
      )}
    </div>
  )
}
